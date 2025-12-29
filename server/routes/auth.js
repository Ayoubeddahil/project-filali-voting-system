const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { readDB, writeDB } = require('../utils/db');

const router = express.Router();
const JWT_SECRET = 'fake-jwt-secret-for-demo-only';

// Load mock Google users
const googleUsersPath = path.join(__dirname, '..', 'mock', 'googleUsers.json');
const mockGoogleUsers = JSON.parse(fs.readFileSync(googleUsersPath, 'utf8'));

// Simulate Google OAuth login
router.post('/google/login', (req, res) => {
  const { email } = req.body;
  
  // Find user in mock Google users
  const user = mockGoogleUsers.find(u => u.email === email);
  
  if (!user) {
    return res.status(404).json({ error: 'Google account not found' });
  }

  // Create fake JWT token
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Save user to fake database
  const db = readDB();
  const existingUserIndex = db.users.findIndex(u => u.email === user.email);
  
  if (existingUserIndex >= 0) {
    db.users[existingUserIndex] = { ...user, lastLogin: new Date().toISOString() };
  } else {
    db.users.push({ ...user, lastLogin: new Date().toISOString() });
  }
  writeDB(db);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role
    }
  });
});

// Get mock Google users for login selection
router.get('/google/users', (req, res) => {
  res.json({ users: mockGoogleUsers });
});

// Verify token
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = readDB();
    const user = db.users.find(u => u.email === decoded.email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;

