const express = require('express');
const fs = require('fs');
const path = require('path');
const logger = require('./config/logger');
const readRegister = require('./services/readRegister');
const { initWebSocket } = require('./websocket/websocketClient');

const app = express();
const port = process.env.PORT || 3000;

const versionPath = path.join(__dirname, '../VERSION');
let version = 'unknown';
if (fs.existsSync(versionPath)) {
  version = fs.readFileSync(versionPath, 'utf8').trim();
}
app.get('/', async (req, res) => {
  const readings = await readRegister();
  res.json({ version, readings });
});

app.listen(port, () => {
  logger.info(`Server is listening on port ${port}`);
  logger.info(`Running latest version ${version}`);
  initWebSocket();
});
