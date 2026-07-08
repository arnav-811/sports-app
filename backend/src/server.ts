import 'dotenv/config';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { app } from './app';
import { setupSocketHandlers } from './services/socketService';
import { getRedis } from './lib/redis';
import { startCronJobs } from './jobs/svScoreCron';
import { startEconomyCronJobs } from './jobs/economyCron';
import { startDirectorCronJobs } from './jobs/directorCron';

const PORT = parseInt(process.env.PORT || '4000', 10);

async function start() {
  const dbUrl = process.env.DATABASE_URL || 'NOT SET';
  const maskedDb = dbUrl.replace(/:([^:@]+)@/, ':****@');
  console.log(`🗄️  DATABASE_URL: ${maskedDb}`);
  // Ensure Redis connects (non-fatal if unavailable)
  try {
    await getRedis().connect();
    console.log('✅ Redis connected');
  } catch {
    console.warn('⚠️  Redis unavailable — caching disabled');
  }

  const httpServer = http.createServer(app);

  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  setupSocketHandlers(io);
  startCronJobs();
  startEconomyCronJobs();
  startDirectorCronJobs();

  httpServer.listen(PORT, () => {
    console.log(`🚀 Sportverse backend running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io ready`);
    console.log(`📖 API: http://localhost:${PORT}/api/v1`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
