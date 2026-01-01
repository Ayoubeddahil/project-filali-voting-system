const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const roomsRoutes = require('./routes/rooms');
const pollsRoutes = require('./routes/polls');
const adminRoutes = require('./routes/admin');
const googleRoutes = require('./routes/google');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dbPath = path.join(__dirname, 'db.json');
if (!fs.existsSync(dbPath)) {
  const initialDb = {
    users: [],
    rooms: [],
    polls: [],
    votes: [],
    activities: []
  };
  fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2));
}

const { seedDatabase } = require('./utils/seedData');
try {
  seedDatabase();
} catch (error) {
  console.log('Note: Some demo data may already exist');
}

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/polls', pollsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/google', googleRoutes);

const exportsDir = path.join(__dirname, 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}
app.use('/api/google/sheets/download', express.static(exportsDir));
app.use('/api/google/drive/download', express.static(exportsDir));

require('./socket/roomEvents')(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Fake server running on http://localhost:${PORT}`);
  console.log(`Socket.IO ready for fake real-time events`);
});
