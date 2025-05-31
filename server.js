const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST"]
  }
});

// Simple bot response function
function generateBotResponse(message) {
  return `Bot received: "${message}". This is a test response.`;
}

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('user-message', (message) => {
    console.log('Received message:', message);
    
    // Simulate bot processing time
    setTimeout(() => {
      const botResponse = generateBotResponse(message);
      socket.emit('bot-response', botResponse);
    }, 500);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 