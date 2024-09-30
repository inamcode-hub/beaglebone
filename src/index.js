import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from './common/config/logger.js';
import modbusClient from './modbus/services/modbusClient.js';
import { initWebSocketClient } from './websocket/services/websocketClient.js';
import { dbConnect } from './database/connect/db.js';

// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

const versionPath = path.join(__dirname, '../VERSION');
let version;
if (fs.existsSync(versionPath)) {
  version = fs.readFileSync(versionPath, 'utf8').trim();
}
process.env.FIRMWARE_VERSION = version;

app.get('/', (req, res) => {
  res.json({ version });
});

app.listen(port, () => {
  modbusClient.init();
  logger.info(`App listening on port ${port}`);

  modbusClient.on('dataReady', () => {
    logger.info('Modbus data is ready, initializing WebSocket and database...');
    initWebSocketClient();
    dbConnect();
  });
});

// Ensure to close the Modbus client when the application is shutting down
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing Modbus connection...');
  modbusClient.close(() => {
    logger.info('Modbus connection closed.');
    process.exit(0);
  });
});
