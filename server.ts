// server.ts
import dotenv from "dotenv";
import { createServer } from "http";
import app from "./app";
import { initializeWebSocket } from "./services/websocket";
import { connectRedis } from "./config/redis";

// Suppress dotenv logging
dotenv.config({ debug: false });

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

// Create HTTP server and attach Express app
const httpServer = createServer(app);

// Initialize WebSocket
initializeWebSocket(httpServer);

// Connect to Redis and start server
const startServer = async () => {
  try {
    await connectRedis();
    console.log('✅ Redis connected');
  } catch (error) {
    console.warn('⚠️ Redis connection failed, notifications will not persist:', error);
  }

  httpServer.listen(PORT, () => {
    console.clear();
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║      🚀 STACKLYN BACKEND READY        ║');
    console.log('╚══════════════════════════════════════╝\n');
    console.log(`📍 Port:        ${PORT}`);
    console.log(`🌍 Environment: ${ENV}`);
    console.log(`🔌 WebSocket:   Enabled`);
    console.log(`📬 Redis:       Enabled`);
    console.log(`⏰ Started:     ${new Date().toLocaleString()}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
};

startServer();
