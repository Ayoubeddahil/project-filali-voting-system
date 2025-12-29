# 🚀 Quick Start Guide

## Installation (One Command)

```bash
npm run install-all
```

This installs dependencies for root, server, and client.

## Start the Application

```bash
npm run demo-google
```

This starts both the backend server (port 3001) and frontend (port 5173).

Then open: **http://localhost:5173**

## Demo Flow

### 1. Login
- Click "Sign in with Google"
- Select any demo account:
  - `admin@antigravitie.com` (Super Admin)
  - `teacher@antigravitie.com` (Teacher)
  - `student1@antigravitie.com` (Student)
  - `student2@antigravitie.com` (Student)

### 2. Create a Room
- Click "Create Room"
- Fill in details
- Copy the 6-character room code

### 3. Join Room (from another account)
- Logout and login as different user
- Click "Join Room"
- Enter the room code
- You're in!

### 4. Create Polls
- As room admin, click "Create Poll"
- Add question and 2-4 options
- Set duration (optional)
- Create poll

### 5. Vote
- Click on an option to vote
- See real-time results with charts

### 6. Admin Panel
- Login as `admin@antigravitie.com`
- Click "Admin Panel" in navbar
- View platform statistics

## Troubleshooting

**Port 3001 already in use?**
- Change PORT in `server/index.js`

**Port 5173 already in use?**
- Change port in `client/vite.config.js`

**Database reset?**
- Delete `server/db.json`
- Server will recreate it

**Socket.IO not connecting?**
- Ensure server is running on port 3001
- Check browser console for errors

## Features to Demo

✅ Google OAuth simulation  
✅ Room creation with codes  
✅ Multi-user room joining  
✅ Poll creation and voting  
✅ Real-time updates  
✅ Statistics and charts  
✅ Admin panel  
✅ Google integrations (fake)  

---

**Ready to present!** 🎭

