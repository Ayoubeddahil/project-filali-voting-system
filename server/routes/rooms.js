const express = require('express');
const { readDB, writeDB, generateId, generateRoomCode, addActivity } = require('../utils/db');

const router = express.Router();

// Middleware to verify token (simplified)
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Try to decode token to get user email
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, 'fake-jwt-secret-for-demo-only');
    req.user = { email: decoded.email || req.body.userEmail || 'admin@antigravitie.com' };
  } catch (error) {
    // If token invalid, use body or default
    req.user = { email: req.body.userEmail || 'admin@antigravitie.com' };
  }
  next();
}

// Create room
router.post('/create', verifyToken, (req, res) => {
  const { name, description, topics, isPrivate } = req.body;
  const db = readDB();

  const room = {
    id: generateId('room-'),
    code: generateRoomCode(),
    name,
    description,
    topics: topics || [],
    isPrivate: isPrivate || false,
    creator: req.user.email,
    members: [{
      email: req.user.email,
      role: 'admin',
      joinedAt: new Date().toISOString()
    }],
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  db.rooms.push(room);
  writeDB(db);

  // Add activity
  addActivity('room_created', `Room "${name}" created`, req.user.email, room.id);

  res.json({ room });
});

// Join room by code
router.post('/join', verifyToken, (req, res) => {
  const { code } = req.body;
  const db = readDB();

  const room = db.rooms.find(r => r.code.toUpperCase() === code.toUpperCase() && r.status === 'active');

  if (!room) {
    return res.status(404).json({ error: 'Room not found or inactive' });
  }

  // Check if user already in room
  const existingMember = room.members.find(m => m.email === req.user.email);
  if (!existingMember) {
    room.members.push({
      email: req.user.email,
      role: 'member',
      joinedAt: new Date().toISOString()
    });
    writeDB(db);

    // Add activity
    addActivity('member_joined', `${req.user.email} joined room "${room.name}"`, req.user.email, room.id, null);
  }

  res.json({ room });
});

// Invite user to room
router.post('/:roomId/invite', verifyToken, (req, res) => {
  const { email } = req.body;
  const db = readDB();

  const roomIndex = db.rooms.findIndex(r => r.id === req.params.roomId);
  if (roomIndex === -1) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const room = db.rooms[roomIndex];
  const member = room.members.find(m => m.email === req.user.email);

  if (!member || (member.role !== 'admin' && room.creator !== req.user.email)) {
    return res.status(403).json({ error: 'Not authorized to invite members' });
  }

  // Check if user exists
  const user = db.users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if already a member
  const existingMember = room.members.find(m => m.email === email);
  if (existingMember) {
    return res.status(400).json({ error: 'User is already a member' });
  }

  // Add member
  room.members.push({
    email: email,
    role: 'member',
    joinedAt: new Date().toISOString()
  });

  db.rooms[roomIndex] = room;
  writeDB(db);

  // Add activity
  addActivity('member_joined', `${email} was invited to room "${room.name}"`, req.user.email, room.id);

  res.json({ room, message: 'User invited successfully' });
});

// Get room by ID
router.get('/:roomId', verifyToken, (req, res) => {
  const db = readDB();
  const room = db.rooms.find(r => r.id === req.params.roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  // Get polls for this room
  const roomPolls = db.polls.filter(p => p.roomId === room.id);

  res.json({ room, polls: roomPolls });
});

// Get all rooms for user
router.get('/user/:userEmail', verifyToken, (req, res) => {
  const db = readDB();
  const userEmail = req.params.userEmail;

  const userRooms = db.rooms.filter(r =>
    r.members.some(m => m.email === userEmail) || r.creator === userEmail
  );

  res.json({ rooms: userRooms });
});

// Update room
router.put('/:roomId', verifyToken, (req, res) => {
  const db = readDB();
  const roomIndex = db.rooms.findIndex(r => r.id === req.params.roomId);

  if (roomIndex === -1) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const room = db.rooms[roomIndex];
  const member = room.members.find(m => m.email === req.user.email);

  if (!member || (member.role !== 'admin' && room.creator !== req.user.email)) {
    return res.status(403).json({ error: 'Not authorized to update room' });
  }

  db.rooms[roomIndex] = { ...room, ...req.body };
  writeDB(db);

  res.json({ room: db.rooms[roomIndex] });
});

// Remove member from room
router.delete('/:roomId/members/:memberEmail', verifyToken, (req, res) => {
  const db = readDB();
  const roomIndex = db.rooms.findIndex(r => r.id === req.params.roomId);

  if (roomIndex === -1) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const room = db.rooms[roomIndex];
  const member = room.members.find(m => m.email === req.user.email);

  if (!member || (member.role !== 'admin' && room.creator !== req.user.email)) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  room.members = room.members.filter(m => m.email !== req.params.memberEmail);
  db.rooms[roomIndex] = room;
  writeDB(db);

  res.json({ room });
});

// Search rooms (all public rooms + user's rooms)
router.get('/search/:query', verifyToken, (req, res) => {
  const db = readDB();
  const query = req.params.query.toLowerCase();

  // Get user's rooms
  const userRooms = db.rooms.filter(r =>
    r.members.some(m => m.email === req.user.email) || r.creator === req.user.email
  );

  // Get public rooms (not private)
  const publicRooms = db.rooms.filter(r => !r.isPrivate);

  // Combine and deduplicate
  const allRooms = [...new Map([...userRooms, ...publicRooms].map(r => [r.id, r])).values()];

  // Filter by search query
  const matchingRooms = allRooms.filter(r =>
    r.name.toLowerCase().includes(query) ||
    r.description?.toLowerCase().includes(query) ||
    r.code.toLowerCase().includes(query) ||
    r.topics?.some(t => t.toLowerCase().includes(query))
  );

  res.json({ rooms: matchingRooms });
});

// Delete room (admin only)
router.delete('/:roomId', verifyToken, (req, res) => {
  const db = readDB();
  const roomIndex = db.rooms.findIndex(r => r.id === req.params.roomId);

  if (roomIndex === -1) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const room = db.rooms[roomIndex];

  // Check if user is super admin or room creator
  const isSuperAdmin = db.users.find(u => u.email === req.user.email)?.role === 'super_admin';
  if (!isSuperAdmin && room.creator !== req.user.email) {
    return res.status(403).json({ error: 'Not authorized to delete room' });
  }

  // Delete related polls and votes
  const roomPolls = db.polls.filter(p => p.roomId === room.id);
  const pollIds = roomPolls.map(p => p.id);
  db.polls = db.polls.filter(p => p.roomId !== room.id);
  db.votes = db.votes.filter(v => !pollIds.includes(v.pollId));

  // Delete room
  db.rooms.splice(roomIndex, 1);
  writeDB(db);

  res.json({ message: 'Room deleted successfully' });
});

// Update room (admin only)
router.put('/:roomId', verifyToken, (req, res) => {
  const db = readDB();
  const roomIndex = db.rooms.findIndex(r => r.id === req.params.roomId);

  if (roomIndex === -1) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const room = db.rooms[roomIndex];
  const isSuperAdmin = db.users.find(u => u.email === req.user.email)?.role === 'super_admin';
  const member = room.members.find(m => m.email === req.user.email);

  if (!isSuperAdmin && !member && room.creator !== req.user.email) {
    if (!member || (member.role !== 'admin' && room.creator !== req.user.email)) {
      return res.status(403).json({ error: 'Not authorized to update room' });
    }
  }

  db.rooms[roomIndex] = { ...room, ...req.body, id: room.id, code: room.code };
  writeDB(db);

  res.json({ room: db.rooms[roomIndex] });
});

module.exports = router;

