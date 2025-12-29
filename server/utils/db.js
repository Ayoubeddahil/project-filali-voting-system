const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db.json');

function readDB() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [], rooms: [], polls: [], votes: [], activities: [] };
  }
}

function addActivity(type, description, userId, roomId = null, pollId = null) {
  const db = readDB();
  if (!db.activities) {
    db.activities = [];
  }
  
  const activity = {
    id: generateId('activity-'),
    action: type, // 'room_created', 'poll_created', 'vote', 'member_joined', 'poll_closed'
    type,
    description,
    userId,
    userEmail: userId,
    roomId,
    pollId,
    timestamp: new Date().toISOString()
  };
  
  db.activities.unshift(activity); // Add to beginning
  
  // Keep only last 1000 activities
  if (db.activities.length > 1000) {
    db.activities = db.activities.slice(0, 1000);
  }
  
  writeDB(db);
  return activity;
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function generateId(prefix = '') {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

module.exports = {
  readDB,
  writeDB,
  generateId,
  generateRoomCode,
  addActivity
};

