const express = require('express');
const { readDB, writeDB, generateId, generateRoomCode, addActivity } = require('../utils/db');

const router = express.Router();

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, 'fake-jwt-secret-for-demo-only');
    req.user = { email: decoded.email || req.body.userEmail || 'admin@gmail.com' };
  } catch (error) {
    req.user = { email: req.body.userEmail || 'admin@gmail.com' };
  }
  next();
}

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

  addActivity('room_created', `Room "${name}" created`, req.user.email, room.id);

  res.json({ room });
});

router.post('/join', verifyToken, (req, res) => {
  const { code } = req.body;
  const db = readDB();

  const room = db.rooms.find(r => r.code.toUpperCase() === code.toUpperCase() && r.status === 'active');

  if (!room) {
    return res.status(404).json({ error: 'Room not found or inactive' });
  }

  const existingMember = room.members.find(m => m.email === req.user.email);
  if (!existingMember) {
    room.members.push({
      email: req.user.email,
      role: 'member',
      joinedAt: new Date().toISOString()
    });
    writeDB(db);

    addActivity('member_joined', `${req.user.email} joined room "${room.name}"`, req.user.email, room.id, null);
  }

  res.json({ room });
});

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

  const user = db.users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const existingMember = room.members.find(m => m.email === email);
  if (existingMember) {
    return res.status(400).json({ error: 'User is already a member' });
  }

  room.members.push({
    email: email,
    role: 'member',
    joinedAt: new Date().toISOString()
  });

  db.rooms[roomIndex] = room;
  writeDB(db);

  addActivity('member_joined', `${email} was invited to room "${room.name}"`, req.user.email, room.id);

  res.json({ room, message: 'User invited successfully' });
});

router.get('/:roomId', verifyToken, (req, res) => {
  const db = readDB();
  const room = db.rooms.find(r => r.id === req.params.roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const roomPolls = db.polls.filter(p => p.roomId === room.id);

  res.json({ room, polls: roomPolls });
});

router.get('/user/:userEmail', verifyToken, (req, res) => {
  const db = readDB();
  const userEmail = req.params.userEmail;

  const userRooms = db.rooms.filter(r =>
    r.members.some(m => m.email === userEmail) || r.creator === userEmail
  );

  res.json({ rooms: userRooms });
});

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

router.get('/search/', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  let userEmail = null;

  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, 'fake-jwt-secret-for-demo-only');
      userEmail = decoded.email;
    } catch (e) { }
  }

  const db = readDB();

  const userRooms = userEmail ? db.rooms.filter(r =>
    r.members.some(m => m.email === userEmail) || r.creator === userEmail
  ) : [];

  const publicRooms = db.rooms.filter(r => !r.isPrivate);

  const allRooms = [...new Map([...userRooms, ...publicRooms].map(r => [r.id, r])).values()];

  res.json({ rooms: allRooms });
});

router.get('/search/:query', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  let userEmail = null;

  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, 'fake-jwt-secret-for-demo-only');
      userEmail = decoded.email;
    } catch (e) { }
  }

  const db = readDB();
  const query = req.params.query.toLowerCase();

  const userRooms = userEmail ? db.rooms.filter(r =>
    r.members.some(m => m.email === userEmail) || r.creator === userEmail
  ) : [];

  const publicRooms = db.rooms.filter(r => !r.isPrivate);

  const allRooms = [...new Map([...userRooms, ...publicRooms].map(r => [r.id, r])).values()];

  const matchingRooms = allRooms.filter(r =>
    r.name.toLowerCase().includes(query) ||
    r.description?.toLowerCase().includes(query) ||
    r.code.toLowerCase().includes(query) ||
    r.topics?.some(t => t.toLowerCase().includes(query))
  );

  res.json({ rooms: matchingRooms });
});

router.delete('/:roomId', verifyToken, (req, res) => {
  const db = readDB();
  const roomIndex = db.rooms.findIndex(r => r.id === req.params.roomId);

  if (roomIndex === -1) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const room = db.rooms[roomIndex];

  const isSuperAdmin = db.users.find(u => u.email === req.user.email)?.role === 'super_admin';
  if (!isSuperAdmin && room.creator !== req.user.email) {
    return res.status(403).json({ error: 'Not authorized to delete room' });
  }

  const roomPolls = db.polls.filter(p => p.roomId === room.id);
  const pollIds = roomPolls.map(p => p.id);
  db.polls = db.polls.filter(p => p.roomId !== room.id);
  db.votes = db.votes.filter(v => !pollIds.includes(v.pollId));

  db.rooms.splice(roomIndex, 1);
  writeDB(db);

  res.json({ message: 'Room deleted successfully' });
});

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
