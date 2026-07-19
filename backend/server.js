require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const http = require('http');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
