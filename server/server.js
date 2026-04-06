const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);

app.get('/', (req, res) => {
  res.json({
    message: 'Student Tracker API Running', status: 'OK',
    timestamp: new Date().toISOString(),
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/subjects',    require('./routes/subjects'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/attendance',  require('./routes/attendance'));
app.use('/api/goals',       require('./routes/goals'));
app.use('/api/dashboard',   require('./routes/dashboard'));
app.use('/api/resources',   require('./routes/resources'));
app.use('/api/feedback',    require('./routes/feedback'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
  process.exit(1);
});

module.exports = app;
