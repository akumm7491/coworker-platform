import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5175",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ["http://localhost:5175"]
}));
app.use(express.json());

// Sample data
let agents = [
  {
    id: uuidv4(),
    name: "Agent Smith",
    status: "working",
    type: "assistant",
    tasks_completed: 15,
    success_rate: 0.95
  }
];

let projects = [
  {
    id: uuidv4(),
    name: "Project Alpha",
    status: "in_progress",
    completion: 75,
    agents_assigned: 2
  }
];

// REST endpoints
app.get('/api/agents', (req, res) => {
  res.json(agents);
});

app.get('/api/projects', (req, res) => {
  res.json(projects);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// WebSocket events
io.on('connection', (socket) => {
  console.log('Client connected');

  // Send initial data
  socket.emit('agents:update', agents);
  socket.emit('projects:update', projects);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
