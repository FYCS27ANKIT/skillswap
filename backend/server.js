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
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route for Testing
app.get('/', (req, res) => {
  res.send('Skill Swap API is running!');
});

// Import Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/swaps', require('./routes/swapRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/workspace', require('./routes/workspaceRoutes'));

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('Connected to socket.io', socket.id);
  
  // Setup user personal room so they can receive direct messages anytime
  socket.on('setup', (userId) => {
    socket.join(userId);
    console.log('User joined their personal room:', userId);
    socket.emit('connected');
  });

  // Handle incoming message and broadcast to receiver
  socket.on('new message', (message) => {
    socket.in(message.receiver).emit('message received', message);
  });

  // Workspace Socket Syncing
  socket.on('workspace:join', (roomId) => {
    socket.join(roomId);
    console.log(`User joined workspace room: ${roomId}`);
  });

  socket.on('workspace:change', ({ roomId, content }) => {
    socket.in(roomId).emit('workspace:updated', content);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from socket');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
