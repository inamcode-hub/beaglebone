const WebSocket = require('ws');
const logger = require('../config/logger');
const { handleMessage } = require('../controllers/websocketController');

function initWebSocket() {
  const ws = new WebSocket(process.env.WEBSOCKET_SERVER_URL);

  console.log(
    `WebSocket client connecting to ${process.env.WEBSOCKET_SERVER_URL}`
  );

  ws.on('open', () => {
    logger.info('WebSocket connection established');
  });

  ws.on('message', (message) => {
    handleMessage(ws, message);
  });

  ws.on('close', () => {
    logger.info('WebSocket connection closed');
  });

  ws.on('error', (error) => {
    logger.error(`WebSocket error: ${error.message}`);
  });

  return ws;
}

module.exports = { initWebSocket };
