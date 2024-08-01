import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import logger from './common/config/logger.js';
import { initWebSocketClient } from './websocket/services/websocketClient.js';

// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const versionPath = path.join(__dirname, '../VERSION');
let version;
if (fs.existsSync(versionPath)) {
  version = fs.readFileSync(versionPath, 'utf8').trim();
}
process.env.FIRMWARE_VERSION = version;

app.get('/', (req, res) => {
  res.json({ version });
});

app.get('/reboot', (req, res) => {
  exec(
    'sudo /usr/local/bin/scripts/reboot-system.sh',
    (error, stdout, stderr) => {
      if (error) {
        logger.error(`Reboot error: ${error.message}`);
        return res.status(500).send('Failed to reboot');
      }
      if (stderr) {
        logger.error(`Reboot stderr: ${stderr}`);
        return res.status(500).send('Failed to reboot');
      }
      res.send('Rebooting system...');
    }
  );
});

app.listen(port, () => {
  logger.info(`App listening on port ${port}`);
  initWebSocketClient();
});
