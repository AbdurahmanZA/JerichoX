// api-server.js - JerichoX Security Platform API Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

console.log('🛡️  JERICHO SECURITY PLATFORM API SERVER');
console.log('==========================================');
console.log(`Port: ${PORT}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Database: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect()
  .then(client => {
    console.log('✅ Database connected successfully');
    client.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple session middleware without Redis for now
app.use((req, res, next) => {
  req.session = {};
  next();
});

// JWT Authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const dbResult = await pool.query('SELECT 1 as test');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '2.0.0',
      database: 'connected',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

// API Routes

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    // Get user from database
    const userResult = await pool.query(
      'SELECT id, username, email, password_hash, role, permissions, is_active FROM users WHERE username = $1',
      [username]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = userResult.rows[0];
    
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account disabled' });
    }
    
    // For demo purposes, accept hardcoded passwords
    const isValidPassword = password === 'admin123' && username === 'admin' ||
                           password === 'operator123' && username === 'operator';
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Camera routes
app.get('/api/cameras', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, type, manufacturer, model, url, location, zone, 
             status, capabilities, settings, last_seen, is_recording, 
             has_audio, has_ptz, created_at, updated_at
      FROM cameras 
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      cameras: result.rows
    });
  } catch (error) {
    console.error('Get cameras error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/cameras', async (req, res) => {
  try {
    const { 
      name, type, manufacturer, model, url, username, password, 
      location, zone, has_audio, has_ptz, capabilities 
    } = req.body;
    
    if (!name || !type || !url || !location || !zone) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    const result = await pool.query(`
      INSERT INTO cameras (name, type, manufacturer, model, url, username, password_encrypted, 
                          location, zone, has_audio, has_ptz, capabilities, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'offline')
      RETURNING *
    `, [name, type, manufacturer, model, url, username, password, location, zone, has_audio, has_ptz, capabilities || []]);
    
    res.status(201).json({
      success: true,
      camera: result.rows[0]
    });
  } catch (error) {
    console.error('Create camera error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/cameras/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, type, manufacturer, model, url, username, password, 
      location, zone, status, has_audio, has_ptz, capabilities 
    } = req.body;
    
    const result = await pool.query(`
      UPDATE cameras SET 
        name = COALESCE($1, name),
        type = COALESCE($2, type),
        manufacturer = COALESCE($3, manufacturer),
        model = COALESCE($4, model),
        url = COALESCE($5, url),
        username = COALESCE($6, username),
        password_encrypted = COALESCE($7, password_encrypted),
        location = COALESCE($8, location),
        zone = COALESCE($9, zone),
        status = COALESCE($10, status),
        has_audio = COALESCE($11, has_audio),
        has_ptz = COALESCE($12, has_ptz),
        capabilities = COALESCE($13, capabilities),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `, [name, type, manufacturer, model, url, username, password, location, zone, status, has_audio, has_ptz, capabilities, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Camera not found' });
    }
    
    res.json({
      success: true,
      camera: result.rows[0]
    });
  } catch (error) {
    console.error('Update camera error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/cameras/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM cameras WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Camera not found' });
    }
    
    res.json({
      success: true,
      message: 'Camera deleted successfully'
    });
  } catch (error) {
    console.error('Delete camera error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User routes
app.get('/api/users', authenticateJWT, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, email, role, permissions, last_login, is_active, created_at
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Settings routes
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT key, value, description, category, updated_at
      FROM settings 
      ORDER BY category, key
    `);
    
    res.json({
      success: true,
      settings: result.rows
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const result = await pool.query(`
      UPDATE settings SET value = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE key = $2 
      RETURNING *
    `, [value, key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json({
      success: true,
      setting: result.rows[0]
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Incident routes
app.get('/api/incidents', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, c.name as camera_name, u.username as assigned_user
      FROM incidents i
      LEFT JOIN cameras c ON i.camera_id = c.id
      LEFT JOIN users u ON i.assigned_to = u.id
      ORDER BY i.created_at DESC
    `);
    
    res.json({
      success: true,
      incidents: result.rows
    });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Socket.IO for real-time communication
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log('==========================================');
  console.log(`✅ JerichoX API Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API endpoints: http://localhost:${PORT}/api/*`);
  console.log('==========================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    pool.end();
    process.exit(0);
  });
});
