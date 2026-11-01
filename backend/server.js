require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const http = require('http');
const { Server } = require('socket.io');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://fycs27ankit.github.io'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const connectedUsers = new Map();
const connectedUserSockets = new Map();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://fycs27ankit.github.io'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Basic Route for Testing
app.get('/', (req, res) => {
  res.send('Skill Swap API is running!');
});

app.get('/api/chat/connected-users', (req, res) => {
  const users = Array.from(connectedUsers.values()).map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
  }));
  res.json(users);
});

// Import Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/swaps', require('./routes/swapRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/credits', require('./routes/creditRoutes'));
app.use('/api/workshops', require('./routes/workshopRoutes'));

io.on('connection', (socket) => {
  socket.on('authenticate', ({ user }) => {
    if (!user?.email) return;

    const userProfile = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      socketId: socket.id,
    };

    connectedUsers.set(socket.id, userProfile);
    connectedUserSockets.set((user._id || user.id).toString(), socket.id);

    const onlineUsers = Array.from(connectedUsers.values()).map((connectedUser) => ({
      id: connectedUser.id,
      name: connectedUser.name,
      email: connectedUser.email,
    }));

    io.emit('connected-users', onlineUsers);
  });

  socket.on('send-message', (payload) => {
    const receiverSocketId = connectedUserSockets.get(payload.receiverId?.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new-message', payload);
    }
  });

  socket.on('notify-user', ({ targetUserId, type, data }) => {
    const targetSocketId = connectedUserSockets.get(targetUserId?.toString());
    if (targetSocketId) {
      io.to(targetSocketId).emit('notification', { type, data, timestamp: new Date() });
    }
  });

  // Collaborative Live Workspace (Code Sandbox & Digital Whiteboard)
  socket.on('join-workspace', ({ roomId, user }) => {
    if (!roomId) return;
    const roomName = `workspace_${roomId}`;
    socket.join(roomName);
    socket.to(roomName).emit('workspace-user-joined', {
      user: user ? { id: user._id || user.id, name: user.name, email: user.email } : { id: socket.id, name: 'Partner' },
      timestamp: new Date(),
    });
  });

  socket.on('leave-workspace', ({ roomId, user }) => {
    if (!roomId) return;
    const roomName = `workspace_${roomId}`;
    socket.leave(roomName);
    socket.to(roomName).emit('workspace-user-left', {
      user: user ? { id: user._id || user.id, name: user.name } : null,
    });
  });

  socket.on('workspace-code-update', ({ roomId, code, language, sender }) => {
    if (!roomId) return;
    socket.to(`workspace_${roomId}`).emit('workspace-code-sync', { code, language, sender });
  });

  socket.on('workspace-draw-update', ({ roomId, stroke, sender }) => {
    if (!roomId) return;
    socket.to(`workspace_${roomId}`).emit('workspace-draw-sync', { stroke, sender });
  });

  socket.on('workspace-clear-canvas', ({ roomId, sender }) => {
    if (!roomId) return;
    socket.to(`workspace_${roomId}`).emit('workspace-clear-sync', { sender });
  });

  socket.on('disconnect', () => {
    if (connectedUsers.has(socket.id)) {
      const disconnectedUser = connectedUsers.get(socket.id);
      connectedUsers.delete(socket.id);
      connectedUserSockets.delete((disconnectedUser.id || '').toString());
      const onlineUsers = Array.from(connectedUsers.values()).map((connectedUser) => ({
        id: connectedUser.id,
        name: connectedUser.name,
        email: connectedUser.email,
      }));
      io.emit('connected-users', onlineUsers);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
