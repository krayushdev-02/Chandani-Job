import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Config & Middlewares
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import apiRoutes from './routes/apiRoutes';
import { SocketService } from './services/socketService';

// Initialize configuration
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(helmet());
app.use(compression());
app.use(cors({ origin: '*' })); // Customize for security in production
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Http Request Logger
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) },
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend service is operational' });
});

// Mounting main API router
app.use('/api/v1', apiRoutes);

// Error Handling Middleware (must be registered last)
app.use(errorHandler);

// Initialize Socket.io Server
SocketService.initialize(httpServer);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
