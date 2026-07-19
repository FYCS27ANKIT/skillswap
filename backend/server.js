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
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const connectedUsers = new Map();
const connectedUserSockets = new Map();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://fycs27ankit.github.io"
  ],
  credentials: true
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
