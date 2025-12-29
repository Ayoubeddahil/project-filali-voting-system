module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Fake client connected: ${socket.id}`);

    // Join room channel
    socket.on('join_room', ({ roomId, user }) => {
      socket.join(roomId);
      console.log(`📥 Fake client joined room: ${roomId}`);

      // Notify others (simulated)
      socket.to(roomId).emit('user_joined', {
        user: { name: user?.name, email: user?.email },
        time: new Date()
      });
    });

    // Leave room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`📤 Fake client left room: ${roomId}`);
    });

    // Handle chat messages
    socket.on('send_message', (data) => {
      // data: { roomId, user, text, pollId (optional) }
      console.log(`💬 Message in ${data.roomId}: ${data.text}`);

      // Broadcast to everyone in room including sender (for simplicity in this demo)
      io.to(data.roomId).emit('receive_message', {
        id: Date.now().toString(),
        text: data.text,
        user: data.user,
        timestamp: new Date(),
        pollId: data.pollId || null // If null, it's general chat
      });
    });

    // Existing events...
    socket.on('create_poll', (data) => {
      io.to(data.roomId).emit('poll_created', data.poll);
    });

    socket.on('vote_update', (data) => {
      io.to(data.roomId).emit('poll_updated', data);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Fake client disconnected: ${socket.id}`);
    });
  });
};
