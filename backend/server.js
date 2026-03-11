import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import stationRoutes from './routes/stationRoutes.js';
import shortestPathRoutes from './routes/shortestPath.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://indore-metro.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log('📚 Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose disconnected from DB');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('⏏️ Mongoose connection disconnected through app termination');
  process.exit(0);
});

app.get('/', (req, res) => {
  res.json({
    message: 'Indore Metro Backend is running 🚆',
    status: 'operational',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(dbStatus === 'connected' ? 200 : 503).json({
    status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
    database: dbStatus,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/stations', stationRoutes);
app.use('/api/shortest-path', shortestPathRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    suggestion: 'Check /api/stations for available endpoints',
    requestedUrl: req.originalUrl
  });
});

app.use((err, req, res, next) => {
  console.error('🔥 Unhandled error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && {
      stack: err.stack,
      fullError: err
    })
  });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  connectDB();
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 125 * 1000;

export default server;