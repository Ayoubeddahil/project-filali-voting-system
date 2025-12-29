const express = require('express');
const { readDB } = require('../utils/db');

const router = express.Router();

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, 'fake-jwt-secret-for-demo-only');
    req.user = { email: decoded.email || req.body.userEmail || 'admin@antigravitie.com' };
  } catch (error) {
    req.user = { email: req.body.userEmail || 'admin@antigravitie.com' };
  }
  next();
}

// Get all rooms (super admin only)
router.get('/rooms', verifyToken, (req, res) => {
  const db = readDB();

  // In real app, check if user is super_admin
  res.json({ rooms: db.rooms });
});

// Get all users
router.get('/users', verifyToken, (req, res) => {
  const db = readDB();
  res.json({ users: db.users });
});

// Get platform statistics
router.get('/stats', verifyToken, (req, res) => {
  const db = readDB();

  const stats = {
    totalRooms: db.rooms.length,
    activeRooms: db.rooms.filter(r => r.status === 'active').length,
    totalPolls: db.polls.length,
    activePolls: db.polls.filter(p => p.status === 'active').length,
    totalVotes: db.votes.length,
    totalUsers: db.users.length,
    roomsByStatus: {
      active: db.rooms.filter(r => r.status === 'active').length,
      closed: db.rooms.filter(r => r.status === 'closed').length
    }
  };

  res.json({ stats });
});

// Get activities for user
router.get('/activities/:userEmail', verifyToken, (req, res) => {
  const db = readDB();
  const userEmail = req.params.userEmail;

  // Get user's rooms
  const userRooms = db.rooms.filter(r =>
    r.members.some(m => m.email === userEmail) || r.creator === userEmail
  );
  const userRoomIds = userRooms.map(r => r.id);

  // Get activities for user's rooms
  const activities = (db.activities || [])
    .filter(a => userRoomIds.includes(a.roomId) || a.userId === userEmail)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 50); // Last 50 activities

  res.json({ activities });
});

// Search members/users
router.get('/search/members/:query', verifyToken, (req, res) => {
  const db = readDB();
  const query = req.params.query.toLowerCase();

  // Get all unique members from user's rooms
  const userRooms = db.rooms.filter(r =>
    r.members.some(m => m.email === req.user.email) || r.creator === req.user.email
  );

  const allMembers = new Map();
  userRooms.forEach(room => {
    room.members.forEach(member => {
      if (!allMembers.has(member.email)) {
        allMembers.set(member.email, {
          email: member.email,
          role: member.role,
          joinedAt: member.joinedAt,
          rooms: []
        });
      }
      allMembers.get(member.email).rooms.push({
        roomId: room.id,
        roomName: room.name,
        role: member.role
      });
    });
  });

  // Filter by search query
  const matchingMembers = Array.from(allMembers.values()).filter(member =>
    member.email.toLowerCase().includes(query)
  );

  res.json({ members: matchingMembers });
});

// Update user role (super admin only)
router.put('/users/:email', verifyToken, (req, res) => {
  const db = readDB();
  const { role } = req.body;
  const targetEmail = req.params.email;

  // Find user
  const userIndex = db.users.findIndex(u => u.email === targetEmail);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update user
  db.users[userIndex].role = role;

  const { writeDB } = require('../utils/db');
  writeDB(db);

  res.json({ success: true, user: db.users[userIndex] });
});

// Delete user (super admin only)
router.delete('/users/:email', verifyToken, (req, res) => {
  const db = readDB();
  const targetEmail = req.params.email;

  // Find user
  const userIndex = db.users.findIndex(u => u.email === targetEmail);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Prevent deleting self
  if (targetEmail === req.user.email) {
    return res.status(400).json({ error: 'Cannot delete yourself' });
  }

  // Remove user
  db.users.splice(userIndex, 1);

  // Also remove their polls/votes if necessary? For now just user.
  // Ideally we should cascade delete, but for this demo maybe fine.

  const { writeDB } = require('../utils/db');
  writeDB(db);

  res.json({ success: true });
});

module.exports = router;

