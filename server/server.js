require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3001;
const app = express();
const router = require('./router/index');
const errorMiddleware = require('./exceptions/error-middleware');

app.use(express.json())
app.use(cookieParser());

// CORS configuration for multiple origins
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:3000'];
app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    // Allow requests without origin (e.g., mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'CORS policy does not allow access from origin: ' + origin;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use('/', router);
app.use(errorMiddleware);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.message);
    return res.status(500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        app.listen(PORT, () => console.log(`Server start on Port: ${PORT}`))
    } catch (e) {
        console.log(e);
    }
}

start();
