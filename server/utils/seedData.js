const { readDB, writeDB, generateId, generateRoomCode } = require('./db');
const fs = require('fs');
const path = require('path');

function seedDatabase() {
  const db = readDB();

  const demoUsers = [
    {
      id: "google-005",
      email: "professor@gmail.com",
      name: "Prof. Michael Chen",
      picture: "https://ui-avatars.com/api/?name=Michael+Chen&background=8b5cf6&color=fff&size=128",
      role: "teacher",
      verified: true,
      lastLogin: new Date().toISOString()
    },
    {
      id: "google-006",
      email: "student3@gmail.com",
      name: "Emma Wilson",
      picture: "https://ui-avatars.com/api/?name=Emma+Wilson&background=f59e0b&color=fff&size=128",
      role: "student",
      verified: true,
      lastLogin: new Date().toISOString()
    },
    {
      id: "google-007",
      email: "student4@gmail.com",
      name: "Ryan Martinez",
      picture: "https://ui-avatars.com/api/?name=Ryan+Martinez&background=10b981&color=fff&size=128",
      role: "student",
      verified: true,
      lastLogin: new Date().toISOString()
    },
    {
      id: "google-008",
      email: "teamlead@gmail.com",
      name: "Lisa Anderson",
      picture: "https://ui-avatars.com/api/?name=Lisa+Anderson&background=ef4444&color=fff&size=128",
      role: "manager",
      verified: true,
      lastLogin: new Date().toISOString()
    }
  ];

  demoUsers.forEach(user => {
    const exists = db.users.find(u => u.email === user.email);
    if (!exists) {
      db.users.push(user);
    }
  });

  const demoRooms = [
    {
      id: generateId('room-'),
      code: generateRoomCode(),
      name: "Advanced Mathematics",
      description: "Calculus and advanced algebra discussions",
      topics: ["calculus", "algebra", "geometry"],
      isPrivate: false,
      creator: "professor@gmail.com",
      members: [
        { email: "professor@gmail.com", role: "admin", joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { email: "student3@gmail.com", role: "member", joinedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
        { email: "student4@gmail.com", role: "member", joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active"
    },
    {
      id: generateId('room-'),
      code: generateRoomCode(),
      name: "Team Sprint Planning",
      description: "Weekly sprint planning and retrospectives",
      topics: ["agile", "sprint", "planning"],
      isPrivate: false,
      creator: "teamlead@gmail.com",
      members: [
        { email: "teamlead@gmail.com", role: "admin", joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { email: "professor@gmail.com", role: "member", joinedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
        { email: "student3@gmail.com", role: "member", joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { email: "student4@gmail.com", role: "member", joinedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active"
    },
    {
      id: generateId('room-'),
      code: generateRoomCode(),
      name: "Science Lab Discussions",
      description: "Physics and chemistry lab results",
      topics: ["physics", "chemistry", "lab"],
      isPrivate: false,
      creator: "professor@gmail.com",
      members: [
        { email: "professor@gmail.com", role: "admin", joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { email: "student3@gmail.com", role: "member", joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { email: "student4@gmail.com", role: "member", joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { email: "student1@gmail.com", role: "member", joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active"
    }
  ];

  demoRooms.forEach(room => {
    const exists = db.rooms.find(r => r.name === room.name);
    if (!exists) {
      db.rooms.push(room);
    }
  });

  const demoPolls = [];
  db.rooms.forEach(room => {
    if (room.name === "Advanced Mathematics") {
      demoPolls.push({
        id: generateId('poll-'),
        roomId: room.id,
        question: "Which calculus topic should we focus on next?",
        options: [
          { id: "opt-0", text: "Derivatives and Limits", votes: 15 },
          { id: "opt-1", text: "Integration Techniques", votes: 12 },
          { id: "opt-2", text: "Applications of Calculus", votes: 8 }
        ],
        duration: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        endsAt: null,
        status: "active",
        creator: "professor@gmail.com",
        totalVotes: 35
      });
      demoPolls.push({
        id: generateId('poll-'),
        roomId: room.id,
        question: "How difficult was the last exam?",
        options: [
          { id: "opt-0", text: "Very Easy", votes: 2 },
          { id: "opt-1", text: "Easy", votes: 5 },
          { id: "opt-2", text: "Moderate", votes: 18 },
          { id: "opt-3", text: "Difficult", votes: 10 }
        ],
        duration: null,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        endsAt: null,
        status: "closed",
        creator: "professor@gmail.com",
        totalVotes: 35
      });
    } else if (room.name === "Team Sprint Planning") {
      demoPolls.push({
        id: generateId('poll-'),
        roomId: room.id,
        question: "What should be our next sprint goal?",
        options: [
          { id: "opt-0", text: "Feature Development", votes: 12 },
          { id: "opt-1", text: "Bug Fixes", votes: 8 },
          { id: "opt-2", text: "Performance Optimization", votes: 15 }
        ],
        duration: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        endsAt: null,
        status: "active",
        creator: "teamlead@gmail.com",
        totalVotes: 35
      });
      demoPolls.push({
        id: generateId('poll-'),
        roomId: room.id,
        question: "Best time for daily standup?",
        options: [
          { id: "opt-0", text: "9:00 AM", votes: 10 },
          { id: "opt-1", text: "10:00 AM", votes: 18 },
          { id: "opt-2", text: "11:00 AM", votes: 7 }
        ],
        duration: null,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        endsAt: null,
        status: "closed",
        creator: "teamlead@gmail.com",
        totalVotes: 35
      });
    } else if (room.name === "Science Lab Discussions") {
      demoPolls.push({
        id: generateId('poll-'),
        roomId: room.id,
        question: "Which experiment was most interesting?",
        options: [
          { id: "opt-0", text: "Chemical Reactions", votes: 20 },
          { id: "opt-1", text: "Physics Mechanics", votes: 12 },
          { id: "opt-2", text: "Optics and Light", votes: 8 }
        ],
        duration: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        endsAt: null,
        status: "active",
        creator: "professor@gmail.com",
        totalVotes: 40
      });
    }
  });

  demoPolls.forEach(poll => {
    const exists = db.polls.find(p => p.question === poll.question && p.roomId === poll.roomId);
    if (!exists) {
      db.polls.push(poll);

      const room = db.rooms.find(r => r.id === poll.roomId);
      if (room) {
        room.members.forEach((member, idx) => {
          if (idx < poll.totalVotes) {
            const optionIndex = idx % poll.options.length;
            db.votes.push({
              id: generateId('vote-'),
              pollId: poll.id,
              optionId: poll.options[optionIndex].id,
              userEmail: member.email,
              votedAt: new Date(Date.now() - (poll.totalVotes - idx) * 60 * 60 * 1000).toISOString()
            });
          }
        });
      }
    }
  });

  writeDB(db);
  console.log('Database seeded with demo data');
}

module.exports = { seedDatabase };
