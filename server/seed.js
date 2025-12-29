const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

const dbPath = path.join(__dirname, 'db.json');

const generateId = (prefix) => `${prefix}${Math.random().toString(36).substr(2, 9)}`;

const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const seedDatabase = () => {
    console.log('🌱 Seeding database...');

    const users = [];
    const rooms = [];
    const polls = [];
    const votes = [];
    const activities = [];

    // Create known users
    const adminUser = {
        email: 'admin@votehub.com',
        name: 'Admin User',
        picture: 'https://ui-avatars.com/api/?name=Admin+User&background=random',
        role: 'super_admin'
    };
    users.push(adminUser);

    const demoUser = {
        email: 'demo@votehub.com',
        name: 'Demo User',
        picture: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
        role: 'user'
    };
    users.push(demoUser);

    // Create 50 random users
    for (let i = 0; i < 50; i++) {
        users.push({
            email: faker.internet.email(),
            name: faker.person.fullName(),
            picture: faker.image.avatar(),
            role: 'user'
        });
    }

    // Create "TEST01" Room
    const testRoom = {
        id: generateId('room-'),
        code: 'TEST01',
        name: 'Official Demo Room',
        description: 'A room to demonstrate the features of VoteHub.',
        topics: ['demo', 'presentation', 'official'],
        isPrivate: false,
        creator: adminUser.email,
        members: [
            { email: adminUser.email, role: 'admin', joinedAt: new Date().toISOString() },
            { email: demoUser.email, role: 'member', joinedAt: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString(),
        status: 'active'
    };
    rooms.push(testRoom);

    // Create 50 random rooms
    for (let i = 0; i < 50; i++) {
        const creator = users[Math.floor(Math.random() * users.length)];
        const room = {
            id: generateId('room-'),
            code: generateRoomCode(),
            name: faker.company.catchPhrase(),
            description: faker.lorem.paragraph(),
            topics: [faker.word.sample(), faker.word.sample()],
            isPrivate: Math.random() > 0.8, // 20% private
            creator: creator.email,
            members: [{ email: creator.email, role: 'admin', joinedAt: faker.date.recent().toISOString() }],
            createdAt: faker.date.recent().toISOString(),
            status: Math.random() > 0.1 ? 'active' : 'closed'
        };
        rooms.push(room);
    }

    // Create polls for rooms
    rooms.forEach(room => {
        const numPolls = Math.floor(Math.random() * 5) + 2; // 2-7 polls per room
        for (let j = 0; j < numPolls; j++) {
            const poll = {
                id: generateId('poll-'),
                roomId: room.id,
                question: faker.lorem.sentence() + '?',
                options: [
                    { id: 'opt1', text: faker.word.words(2), votes: 0 },
                    { id: 'opt2', text: faker.word.words(2), votes: 0 },
                    { id: 'opt3', text: faker.word.words(2), votes: 0 }
                ],
                creator: room.creator,
                createdAt: faker.date.recent().toISOString(),
                status: Math.random() > 0.3 ? 'active' : 'closed',
                totalVotes: 0
            };

            // Generate random votes
            const numVotes = Math.floor(Math.random() * 50);
            for (let k = 0; k < numVotes; k++) {
                const optionIndex = Math.floor(Math.random() * 3);
                poll.options[optionIndex].votes++;
                poll.totalVotes++;

                votes.push({
                    pollId: poll.id,
                    optionId: poll.options[optionIndex].id,
                    userEmail: users[Math.floor(Math.random() * users.length)].email,
                    timestamp: faker.date.recent().toISOString()
                });
            }

            polls.push(poll);
        }
    });

    const db = {
        users,
        rooms,
        polls,
        votes,
        activities
    };

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log('✅ Database seeded with:');
    console.log(`- ${users.length} Users`);
    console.log(`- ${rooms.length} Rooms`);
    console.log(`- ${polls.length} Polls`);
    console.log(`- ${votes.length} Votes`);
};

seedDatabase();
