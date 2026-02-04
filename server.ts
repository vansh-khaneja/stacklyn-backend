// server.ts
import dotenv from "dotenv";
import { createServer } from "http";
import app from "./app";
import { initializeWebSocket } from "./services/websocket";

// Suppress dotenv logging
dotenv.config({ debug: false });

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

// Create HTTP server and attach Express app
const httpServer = createServer(app);

// Initialize WebSocket
initializeWebSocket(httpServer);

httpServer.listen(PORT, () => {
  console.clear();
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║      🚀 STACKLYN BACKEND READY        ║');
  console.log('╚══════════════════════════════════════╝\n');
  console.log(`📍 Port:        ${PORT}`);
  console.log(`🌍 Environment: ${ENV}`);
  console.log(`🔌 WebSocket:   Enabled`);
  console.log(`⏰ Started:     ${new Date().toLocaleString()}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});
