// server.ts
import dotenv from "dotenv";
import app from "./app";

// Suppress dotenv logging
dotenv.config({ debug: false });

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.clear();
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║      🚀 STACKLYN BACKEND READY      ║');
  console.log('╚══════════════════════════════════════╝\n');
  console.log(`📍 Port:        ${PORT}`);
  console.log(`🌍 Environment: ${ENV}`);
  console.log(`⏰ Started:     ${new Date().toLocaleString()}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});
