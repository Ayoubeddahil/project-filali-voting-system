# 🔧 Troubleshooting Guide

## ✅ Your Application is Running!

Based on your output, everything is working correctly:
- ✅ Server running on `http://localhost:3001`
- ✅ Client (Vite) running on `http://localhost:5173`
- ✅ Socket.IO connections established

## 🛑 Stopping the Servers

The "Terminer le programme de commandes (O/N)?" message is Windows PowerShell asking for confirmation.

**To stop the servers:**
1. Press `Ctrl+C` once - this sends the interrupt signal
2. If prompted, type `Y` and press Enter
3. Or simply close the terminal window

**Alternative:** Press `Ctrl+C` twice quickly to force stop.

## 🌐 Accessing the Application

1. Open your browser
2. Go to: **http://localhost:5173**
3. You should see the **Landing Page**

## 🐛 Common Issues

### Issue: Port Already in Use

**Error:** `Port 3001 is already in use` or `Port 5173 is already in use`

**Solution:**
```bash
# Find and kill the process using the port (Windows PowerShell)
netstat -ano | findstr :3001
taskkill /PID <PID> /F

netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

Or change the ports:
- Server port: Edit `server/index.js` → Change `PORT` variable
- Client port: Edit `client/vite.config.js` → Change `server.port`

### Issue: Module Not Found

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Reinstall all dependencies
npm run install-all
```

### Issue: CORS Errors

**Error:** `Access to fetch at 'http://localhost:3001' from origin 'http://localhost:5173' has been blocked by CORS`

**Solution:** Already handled in `server/index.js` with CORS middleware. If issues persist, check:
- Server is running on port 3001
- Client is running on port 5173
- CORS is enabled in server code

### Issue: Socket.IO Connection Failed

**Error:** `WebSocket connection failed`

**Solution:**
- Ensure server is running before client
- Check Socket.IO CORS settings in `server/index.js`
- Clear browser cache and reload

### Issue: Database Errors

**Error:** `Cannot read property 'rooms' of undefined`

**Solution:**
- Delete `server/db.json`
- Restart server (it will recreate the file)
- Or manually create it with: `{"users":[],"rooms":[],"polls":[],"votes":[]}`

## 🔍 Debugging Tips

### Check Server Logs
Look for:
- `🚀 Fake server running on http://localhost:3001` ✅
- `📡 Socket.IO ready for fake real-time events` ✅
- `🔌 Fake client connected: [ID]` ✅

### Check Client Logs
Look for:
- `VITE v5.x.x ready in XXX ms` ✅
- `➜  Local:   http://localhost:5173/` ✅

### Browser Console
Open browser DevTools (F12) and check:
- No red errors in Console tab
- Network tab shows API calls to `localhost:3001`
- Socket.IO connection established

## 🚀 Quick Start Checklist

- [ ] Run `npm run install-all`
- [ ] Run `npm run demo-google`
- [ ] See server message: `🚀 Fake server running`
- [ ] See client message: `VITE ready`
- [ ] Open `http://localhost:5173` in browser
- [ ] See Landing Page
- [ ] Click "Get Started"
- [ ] Select demo account
- [ ] See Dashboard

## 📝 Windows-Specific Notes

### PowerShell Execution Policy
If you get execution policy errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Path Issues
If you see path-related errors, ensure:
- You're in the project root directory
- Paths don't have spaces (your path has spaces: `project filali vote`)
- Consider renaming folder to `project-filali-vote` (no spaces)

### Concurrently Issues
If `concurrently` doesn't work:
```bash
# Install globally
npm install -g concurrently

# Or run servers separately in two terminals:
# Terminal 1:
npm run server

# Terminal 2:
npm run client
```

## 🎯 Expected Behavior

### When Starting:
```
[0] 🚀 Fake server running on http://localhost:3001
[0] 📡 Socket.IO ready for fake real-time events
[1] VITE v5.x.x ready in XXX ms
[1] ➜  Local:   http://localhost:5173/
[0] 🔌 Fake client connected: [ID]
```

### When Using the App:
- Landing page loads
- Click "Get Started" → Auth modal opens
- Select Google account → Redirects to dashboard
- Create room → Room detail page opens
- Create poll → Poll appears
- Vote → Results update

## 💡 Pro Tips

1. **Keep Terminal Open** - Don't close the terminal while using the app
2. **Check Both Ports** - Ensure both 3001 and 5173 are accessible
3. **Clear Browser Cache** - If UI seems outdated, hard refresh (Ctrl+Shift+R)
4. **Use Incognito** - Test with multiple accounts using incognito windows
5. **Check Network Tab** - Verify API calls are successful (200 status)

## 🆘 Still Having Issues?

1. **Check Node Version:**
   ```bash
   node --version  # Should be 16+
   ```

2. **Check npm Version:**
   ```bash
   npm --version
   ```

3. **Clear Everything and Reinstall:**
   ```bash
   # Delete node_modules
   rm -rf node_modules client/node_modules server/node_modules
   
   # Reinstall
   npm run install-all
   ```

4. **Check File Permissions** - Ensure you have read/write access

---

**Your app is running! Just open http://localhost:5173 in your browser!** 🎉

