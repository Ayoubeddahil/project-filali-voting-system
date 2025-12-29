const express = require('express');
const { readDB, writeDB } = require('../utils/db');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Save to Google Sheets - Actually creates a CSV file
router.post('/sheets/save', (req, res) => {
  try {
    const { room, polls } = req.body;
    const db = readDB();
    
    // Create CSV content
    let csv = 'Room Name,Question,Option,Votes,Percentage,Status,Created\n';
    
    if (polls && polls.length > 0) {
      polls.forEach(poll => {
        const totalVotes = poll.totalVotes || poll.options.reduce((sum, opt) => sum + opt.votes, 0);
        poll.options.forEach(option => {
          const percentage = totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(2) : 0;
          csv += `"${room?.name || 'Unknown'}","${poll.question}","${option.text}",${option.votes},${percentage}%,${poll.status},"${poll.createdAt}"\n`;
        });
      });
    }
    
    // Save to exports folder
    const exportsDir = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    const filename = `room-${room?.id || 'export'}-${Date.now()}.csv`;
    const filepath = path.join(exportsDir, filename);
    fs.writeFileSync(filepath, csv);
    
    res.json({
      success: true,
      message: 'Results saved successfully',
      filename: filename,
      downloadUrl: `/api/google/sheets/download/${filename}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download exported file
router.get('/sheets/download/:filename', (req, res) => {
  const exportsDir = path.join(__dirname, '..', 'exports');
  const filepath = path.join(exportsDir, req.params.filename);
  
  if (fs.existsSync(filepath)) {
    res.download(filepath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Share via Google Calendar - Creates calendar event data
router.post('/calendar/share', (req, res) => {
  try {
    const { room, polls } = req.body;
    const activePoll = polls?.find(p => p.status === 'active');
    
    if (!activePoll) {
      return res.json({
        success: false,
        message: 'No active poll to schedule'
      });
    }
    
    // Generate calendar event data (ICS format)
    const eventData = {
      title: `Vote: ${activePoll.question}`,
      description: `Room: ${room?.name}\nQuestion: ${activePoll.question}`,
      start: activePoll.endsAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(new Date(activePoll.endsAt || Date.now() + 24 * 60 * 60 * 1000).getTime() + 60 * 60 * 1000).toISOString(),
      location: `Antigravitie Room: ${room?.code || 'N/A'}`,
      calendarUrl: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(activePoll.question)}&dates=${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
    };
    
    res.json({
      success: true,
      message: 'Calendar event created',
      eventData: eventData,
      calendarUrl: eventData.calendarUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export to Google Drive - Creates JSON export file
router.post('/drive/export', (req, res) => {
  try {
    const { room, polls } = req.body;
    const db = readDB();
    
    // Get all votes for polls in this room
    const roomPolls = polls || [];
    const pollIds = roomPolls.map(p => p.id);
    const roomVotes = db.votes.filter(v => pollIds.includes(v.pollId));
    
    // Create export data
    const exportData = {
      room: {
        id: room?.id,
        name: room?.name,
        code: room?.code,
        description: room?.description,
        createdAt: room?.createdAt
      },
      polls: roomPolls.map(poll => ({
        id: poll.id,
        question: poll.question,
        options: poll.options,
        status: poll.status,
        totalVotes: poll.totalVotes,
        createdAt: poll.createdAt,
        endsAt: poll.endsAt
      })),
      votes: roomVotes,
      exportedAt: new Date().toISOString()
    };
    
    // Save to exports folder
    const exportsDir = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    const filename = `room-${room?.id || 'export'}-${Date.now()}.json`;
    const filepath = path.join(exportsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
    
    res.json({
      success: true,
      message: 'Data exported successfully',
      filename: filename,
      downloadUrl: `/api/google/drive/download/${filename}`,
      dataSize: JSON.stringify(exportData).length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download exported JSON
router.get('/drive/download/:filename', (req, res) => {
  const exportsDir = path.join(__dirname, '..', 'exports');
  const filepath = path.join(exportsDir, req.params.filename);
  
  if (fs.existsSync(filepath)) {
    res.download(filepath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Get Google Contacts - Returns members from user's rooms
router.get('/contacts', (req, res) => {
  try {
    const db = readDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Decode token to get user email (simplified)
    const jwt = require('jsonwebtoken');
    let userEmail;
    try {
      const decoded = jwt.verify(token, 'fake-jwt-secret-for-demo-only');
      userEmail = decoded.email;
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Get all members from user's rooms
    const userRooms = db.rooms.filter(r => 
      r.members.some(m => m.email === userEmail) || r.creator === userEmail
    );
    
    const contactsMap = new Map();
    userRooms.forEach(room => {
      room.members.forEach(member => {
        if (!contactsMap.has(member.email) && member.email !== userEmail) {
          const user = db.users.find(u => u.email === member.email);
          contactsMap.set(member.email, {
            name: user?.name || member.email.split('@')[0],
            email: member.email,
            picture: user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.email)}&size=128`,
            rooms: []
          });
        }
        if (contactsMap.has(member.email)) {
          contactsMap.get(member.email).rooms.push(room.name);
        }
      });
    });
    
    const contacts = Array.from(contactsMap.values());
    
    res.json({
      contacts: contacts,
      total: contacts.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

