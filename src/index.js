import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from './common/config/logger.js';
import { initWebSocketClient } from './websocket/services/websocketClient.js';

// Convert import.meta.url to a file pat
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const versionPath = path.join(__dirname, '../VERSION');
let version = 'unknown';
if (fs.existsSync(versionPath)) {
  version = fs.readFileSync(versionPath, 'utf8').trim();
}

app.get('/', (req, res) => {
  res.json({ version });
});

app.listen(port, () => {
  logger.info(`App listening on port ${port}`);
  initWebSocketClient();
});
