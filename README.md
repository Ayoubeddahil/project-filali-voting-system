# InVote Voting Platform

A **complete, professional** React + Node.js voting platform with **simulated Google OAuth integration**, comprehensive room management, real-time voting, and full admin controls - perfect for presentations and demonstrations.

## 🎯 Features

### 🏠 **Landing Page**
- Professional hero section with animated features
- Feature showcase (Classroom, Team Decisions, Events, Surveys)
- How it works (4-step process)
- Testimonials section
- Call-to-action sections
- Complete footer with links

### 🔐 **Authentication System**
- **Sign Up Modal** - Email/password + Google OAuth simulation
- **Sign In Modal** - Quick login with demo accounts
- **Google OAuth Simulation** - Fake but convincing Google login flow
- Role selection (Teacher/Admin, Student/Voter)
- Organization field for signup

### 📊 **Enhanced Dashboard**
- **Quick Stats Cards** - Active rooms, total votes, today's visits, room members
- **My Active Rooms** - Grid view with room cards
- **Recent Activity Timeline** - Real-time activity feed
- **Quick Actions** - Create room, join room, view analytics

### 🏫 **Full Room Management**
- **6 Tabs Interface:**
  - **Overview** - Room info, active polls, topics, settings summary
  - **Polls** - Complete poll management table with filters
  - **Members** - Member list with roles, join dates, last active
  - **Settings** - Room name, description, privacy, voting rules, danger zone
  - **Analytics** - Participation rate, vote distribution charts, activity timeline
  - **Activity Log** - Complete audit trail of room activities

### 🗳️ **Advanced Poll Creation**
- Question and description fields
- 2-4 options support
- **Duration Settings:**
  - No end date
  - End after X hours
  - End at specific date/time
- **Privacy Settings:**
  - Anonymous voting toggle
  - Show results while voting
  - Allow vote changes
- **Display Options:**
  - Chart type selection (Pie, Bar, Donut)

### 📈 **Real-time Features**
- Live voting updates via Socket.IO (simulated)
- Real-time member count
- Live poll status indicators
- Activity notifications

### 👑 **Super Admin Panel**
- Platform-wide statistics
- All rooms management table
- User management
- System settings
- Analytics dashboard
- Export capabilities

### 🔗 **Google Integrations (Fake)**
- Save to Google Sheets
- Share via Google Calendar
- Export to Google Drive
- Import Google Contacts

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- npm or yarn

### Installation

```bash
# Install all dependencies (root, server, and client)
npm run install-all

# Or install manually:
npm install
cd server && npm install
cd ../client && npm install
```

### Running the Application

```bash
# Start both server and client (recommended)
npm run demo-google

# Or start separately:
npm run server    # Starts backend on http://localhost:3001
npm run client    # Starts frontend on http://localhost:5173
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

**Note:** The app starts at `/landing` - a beautiful landing page. After login, you'll be redirected to `/dashboard`.

## 👤 Demo Accounts

The platform comes with pre-loaded demo Google accounts:

1. **admin@antigravitie.com** - Super Admin (full access)
2. **teacher@antigravitie.com** - Teacher (can create rooms)
3. **student1@antigravitie.com** - Student (can vote)
4. **student2@antigravitie.com** - Student (can vote)
5. **manager@antigravitie.com** - Manager (can create rooms)

## 📖 Usage Guide

### 1. Login
- Click "Sign in with Google"
- Select a demo account from the list
- You'll be redirected to the dashboard

### 2. Create a Room
- Click "Create Room" from the dashboard
- Fill in room details (name, description, topics)
- Click "Create Room"
- Copy the 6-character room code to share

### 3. Join a Room
- Click "Join Room" from the dashboard
- Enter the 6-character room code
- Click "Join Room"

### 4. Create Polls
- Open a room (as admin)
- Click "Create Poll"
- Enter question and 2-4 options
- Optionally set a duration
- Click "Create Poll"

### 5. Vote
- View active polls in the room
- Click on an option to vote
- See real-time results with charts

### 6. Admin Panel
- Login as `admin@antigravitie.com`
- Access "Admin Panel" from the navbar
- View platform statistics and all rooms

## 🏗️ Project Structure

```
invote-voting-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth, Socket)
│   │   └── utils/          # Utilities and API
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── socket/             # Socket.IO handlers
│   ├── mock/               # Mock data
│   ├── utils/              # Utilities
│   └── db.json             # Fake database (JSON)
├── package.json
└── README.md
```

## 🔧 Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Socket.IO Client** - Real-time updates
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Socket.IO** - WebSocket server
- **JSON Web Tokens** - Authentication (simulated)
- **JSON Files** - Fake database

## 🎭 Demo Scenarios

### Scenario 1: Classroom Voting
1. Login as `teacher@antigravitie.com`
2. Create "Math Class" room
3. Share room code with students
4. Students join using code
5. Create poll: "Which topic should we cover next?"
6. Students vote
7. View results with charts

### Scenario 2: Team Meeting
1. Login as `manager@antigravitie.com`
2. Create "Q2 Planning" room
3. Create multiple polls for agenda items
4. Team members vote
5. View live results dashboard

### Scenario 3: Super Admin
1. Login as `admin@antigravitie.com`
2. Access Admin Panel
3. View all rooms and statistics
4. Monitor platform activity

## 🔐 Authentication

The platform uses **simulated Google OAuth**:
- No real Google API keys required
- Pre-loaded demo accounts
- Fake JWT tokens for session management
- All authentication is simulated for demo purposes

## 📊 Fake Google Integrations

The platform includes simulated integrations:
- **Google Sheets** - "Save results" (shows success notification)
- **Google Calendar** - "Share poll" (shows success notification)
- **Google Drive** - "Export data" (shows success notification)
- **Google Contacts** - "Import contacts" (shows fake contact list)

These are **completely fake** and only show UI feedback for demonstration.

## 🗄️ Database

The platform uses a **JSON file** (`server/db.json`) as a fake database:
- No real database setup required
- Data persists between server restarts
- Can be easily reset by deleting the file

## 🎨 Features Demonstrated

- ✅ Google OAuth simulation
- ✅ Room creation and management
- ✅ Poll creation and voting
- ✅ Real-time updates (Socket.IO)
- ✅ Admin hierarchy
- ✅ Statistics and analytics
- ✅ Google service integrations (fake)
- ✅ Responsive design
- ✅ Modern UI/UX

## 📝 Notes

- This is a **demo/presentation platform**
- All Google integrations are **simulated**
- No real external API calls are made
- Perfect for showcasing features without complex setup
- All data is stored locally in JSON files

## 🐛 Troubleshooting

### Port already in use
```bash
# Change ports in:
# - server/index.js (PORT)
# - client/vite.config.js (server.port)
```

### Socket.IO connection issues
- Ensure server is running on port 3001
- Check CORS settings in `server/index.js`

### Database issues
- Delete `server/db.json` to reset
- Server will recreate it automatically

## 📄 License

ISC

## 👨‍💻 Development

For development:
```bash
npm run dev  # Runs both server and client with hot reload
```

## 🎯 Presentation Tips

1. **Start with Google Login** - Show the simulated OAuth flow
2. **Create a Room** - Demonstrate room creation
3. **Join from Another Account** - Show multi-user functionality
4. **Create and Vote** - Show the complete voting flow
5. **Show Statistics** - Display charts and analytics
6. **Demo Google Integrations** - Click the fake integration buttons
7. **Admin Panel** - Show super admin capabilities

---

**Built for demonstration purposes** - All Google integrations are simulated! 🎭

