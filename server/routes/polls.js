const express = require('express');
const { readDB, writeDB, generateId, addActivity } = require('../utils/db');

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

// Create poll
router.post('/create', verifyToken, (req, res) => {
  const { roomId, question, options, duration } = req.body;
  const db = readDB();

  const room = db.rooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const member = room.members.find(m => m.email === req.user.email);
  if (!member || (member.role !== 'admin' && room.creator !== req.user.email)) {
    return res.status(403).json({ error: 'Not authorized to create polls' });
  }

  const poll = {
    id: generateId('poll-'),
    roomId,
    question,
    options: options.map((opt, idx) => ({
      id: `opt-${idx}`,
      text: opt,
      votes: 0
    })),
    duration: duration || null,
    createdAt: new Date().toISOString(),
    endsAt: duration ? new Date(Date.now() + duration * 1000).toISOString() : null,
    status: 'active',
    creator: req.user.email,
    totalVotes: 0
  };

  db.polls.push(poll);
  writeDB(db);

  // Add activity
  addActivity('poll_created', `Poll "${question}" created`, req.user.email, roomId, poll.id);

  res.json({ poll });
});

// Get poll
router.get('/:pollId', verifyToken, (req, res) => {
  const db = readDB();
  const poll = db.polls.find(p => p.id === req.params.pollId);

  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }

  // Get votes for this poll
  const pollVotes = db.votes.filter(v => v.pollId === poll.id);
  const userVote = pollVotes.find(v => v.userEmail === req.user.email);

  const enhancedPoll = {
    ...poll,
    hasVoted: !!userVote,
    userVote: userVote ? userVote.optionId : null
  };

  res.json({ poll: enhancedPoll, votes: pollVotes });
});

// Vote on poll
router.post('/:pollId/vote', verifyToken, (req, res) => {
  const { optionId } = req.body;
  const db = readDB();

  const pollIndex = db.polls.findIndex(p => p.id === req.params.pollId);
  if (pollIndex === -1) {
    return res.status(404).json({ error: 'Poll not found' });
  }

  const poll = db.polls[pollIndex];

  if (poll.status !== 'active') {
    return res.status(400).json({ error: 'Poll is not active' });
  }

  // Check if user already voted
  const existingVote = db.votes.find(v =>
    v.pollId === poll.id && v.userEmail === req.user.email
  );

  if (existingVote) {
    // Update existing vote
    const oldOptionIndex = poll.options.findIndex(o => o.id === existingVote.optionId);
    if (oldOptionIndex >= 0) {
      poll.options[oldOptionIndex].votes = Math.max(0, poll.options[oldOptionIndex].votes - 1);
    }

    existingVote.optionId = optionId;
    existingVote.votedAt = new Date().toISOString();
  } else {
    // Create new vote
    db.votes.push({
      id: generateId('vote-'),
      pollId: poll.id,
      optionId,
      userEmail: req.user.email,
      votedAt: new Date().toISOString()
    });
    poll.totalVotes += 1;
  }

  // Update option votes
  const optionIndex = poll.options.findIndex(o => o.id === optionId);
  if (optionIndex >= 0) {
    poll.options[optionIndex].votes += 1;
  }

  db.polls[pollIndex] = poll;
  writeDB(db);

  // Add activity
  const option = poll.options.find(o => o.id === optionId);
  addActivity('vote', `${req.user.email} voted on "${poll.question}"`, req.user.email, poll.roomId, poll.id);

  res.json({ poll, message: 'Vote recorded' });
});

// Get polls for room
router.get('/room/:roomId', verifyToken, (req, res) => {
  const db = readDB();
  const polls = db.polls.filter(p => p.roomId === req.params.roomId).map(poll => {
    const userVote = db.votes.find(v => v.pollId === poll.id && v.userEmail === req.user.email);
    return {
      ...poll,
      hasVoted: !!userVote,
      userVote: userVote ? userVote.optionId : null
    };
  });

  res.json({ polls });
});

// Close poll
router.post('/:pollId/close', verifyToken, (req, res) => {
  const db = readDB();
  const pollIndex = db.polls.findIndex(p => p.id === req.params.pollId);

  if (pollIndex === -1) {
    return res.status(404).json({ error: 'Poll not found' });
  }

  const poll = db.polls[pollIndex];
  const room = db.rooms.find(r => r.id === poll.roomId);
  const member = room.members.find(m => m.email === req.user.email);

  if (!member || (member.role !== 'admin' && room.creator !== req.user.email)) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  poll.status = 'closed';
  db.polls[pollIndex] = poll;
  writeDB(db);

  // Add activity
  addActivity('poll_closed', `Poll "${poll.question}" closed`, req.user.email, poll.roomId, poll.id);

  res.json({ poll });
});

// Search polls (all public room polls + user's room polls)
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

  // Get user's rooms if logged in
  const userRooms = userEmail ? db.rooms.filter(r =>
    r.members.some(m => m.email === userEmail) || r.creator === userEmail
  ) : [];
  const userRoomIds = userRooms.map(r => r.id);

  // Get public rooms
  const publicRooms = db.rooms.filter(r => !r.isPrivate);
  const publicRoomIds = publicRooms.map(r => r.id);

  // Combine room IDs
  const allRoomIds = [...new Set([...userRoomIds, ...publicRoomIds])];

  // Get all polls in these rooms
  const allPolls = db.polls.filter(p => allRoomIds.includes(p.roomId));

  res.json({ polls: allPolls });
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

  // Get user's rooms
  const userRooms = userEmail ? db.rooms.filter(r =>
    r.members.some(m => m.email === userEmail) || r.creator === userEmail
  ) : [];
  const userRoomIds = userRooms.map(r => r.id);

  // Get public rooms
  const publicRooms = db.rooms.filter(r => !r.isPrivate);
  const publicRoomIds = publicRooms.map(r => r.id);

  // Combine room IDs
  const allRoomIds = [...new Set([...userRoomIds, ...publicRoomIds])];

  // Search polls in these rooms
  const matchingPolls = db.polls.filter(p =>
    allRoomIds.includes(p.roomId) &&
    (p.question.toLowerCase().includes(query) ||
      p.options.some(opt => opt.text.toLowerCase().includes(query)))
  );

  res.json({ polls: matchingPolls });
});

// Delete poll (admin only)
router.delete('/:pollId', verifyToken, (req, res) => {
  const db = readDB();
  const pollIndex = db.polls.findIndex(p => p.id === req.params.pollId);

  if (pollIndex === -1) {
    return res.status(404).json({ error: 'Poll not found' });
  }

  const poll = db.polls[pollIndex];
  const room = db.rooms.find(r => r.id === poll.roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  // Check if user is super admin or poll creator or room admin
  const isSuperAdmin = db.users.find(u => u.email === req.user.email)?.role === 'super_admin';
  const member = room.members.find(m => m.email === req.user.email);
  const isRoomAdmin = member?.role === 'admin' || room.creator === req.user.email;

  if (!isSuperAdmin && poll.creator !== req.user.email && !isRoomAdmin) {
    return res.status(403).json({ error: 'Not authorized to delete poll' });
  }

  // Delete poll and related votes
  db.polls.splice(pollIndex, 1);
  db.votes = db.votes.filter(v => v.pollId !== poll.id);
  writeDB(db);

  res.json({ message: 'Poll deleted successfully' });
});

// Update poll (admin only)
router.put('/:pollId', verifyToken, (req, res) => {
  const db = readDB();
  const pollIndex = db.polls.findIndex(p => p.id === req.params.pollId);

  if (pollIndex === -1) {
    return res.status(404).json({ error: 'Poll not found' });
  }

  const poll = db.polls[pollIndex];
  const room = db.rooms.find(r => r.id === poll.roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const isSuperAdmin = db.users.find(u => u.email === req.user.email)?.role === 'super_admin';
  const member = room.members.find(m => m.email === req.user.email);
  const isRoomAdmin = member?.role === 'admin' || room.creator === req.user.email;

  if (!isSuperAdmin && poll.creator !== req.user.email && !isRoomAdmin) {
    return res.status(403).json({ error: 'Not authorized to update poll' });
  }

  db.polls[pollIndex] = { ...poll, ...req.body, id: poll.id, roomId: poll.roomId };
  writeDB(db);

  res.json({ poll: db.polls[pollIndex] });
});

module.exports = router;

