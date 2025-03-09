const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/influencer_connect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const User = require('./models/User');
const Message = require('./models/Message');

// JWT Secret
const JWT_SECRET = 'your_jwt_secret';

// Authentication Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new Error();
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// Routes
// User Registration
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password,
    });
    
    await user.save();
    
    // Generate JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Login
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
app.get('/api/users/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        bio: req.user.bio,
        avatar: req.user.avatar,
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (for contacts)
app.get('/api/contacts', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('-password');
    
    res.json(users);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages between two users
app.get('/api/messages/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard data
app.get('/api/dashboard', auth, async (req, res) => {
  try {
    // Get total connections (all users except current user)
    const totalConnections = await User.countDocuments({ _id: { $ne: req.user._id } });
    
    // Mock data for demo purposes
    const dashboardData = {
      totalConnections,
      pendingRequests: Math.floor(Math.random() * 5),
      activeChats: Math.floor(Math.random() * 10),
      recentActivity: [
        {
          id: 1,
          type: 'message',
          user: 'influencer1',
          content: 'Sent you a message',
          time: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        },
        {
          id: 2,
          type: 'connection',
          user: 'brandmanager',
          content: 'Connected with you',
          time: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        },
        {
          id: 3,
          type: 'campaign',
          user: 'marketingteam',
          content: 'Invited you to a campaign',
          time: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
        }
      ]
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join a chat room
  socket.on('join', ({ chatId, username }) => {
    socket.join(chatId);
    console.log(`${username} joined chat: ${chatId}`);
  });
  
  // Send a message
  socket.on('sendMessage', async ({ chatId, sender, receiver, content }) => {
    try {
      // Create and save message to database
      const message = new Message({
        chatId,
        sender,
        receiver,
        content
      });
      
      await message.save();
      
      // Broadcast message to the room
      io.to(chatId).emit('message', message);
      
      console.log(`Message sent in ${chatId} by ${sender}`);
    } catch (error) {
      console.error('Message sending error:', error);
    }
  });
  
  // Leave a chat room
  socket.on('leave', ({ chatId, username }) => {
    socket.leave(chatId);
    console.log(`${username} left chat: ${chatId}`);
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 