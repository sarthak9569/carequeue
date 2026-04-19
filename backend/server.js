require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.set('io', io);
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/queue', require('./routes/queue'));

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'Sanctuary Online', db: 'Atlas Connected' })
);

io.on('connection', (socket) => {
  console.log('User connected to Sanctuary Socket:', socket.id);
  socket.on('disconnect', () => console.log('User disconnected from Sanctuary Socket'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`CareQueue Backend running on port ${PORT}`);
});
