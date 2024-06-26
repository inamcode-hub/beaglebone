const WebSocket = require('ws');
const logger = require('../config/logger');
const { handleMessage } = require('../controllers/websocketController');
const { readSerialNumber } = require('../services/modbusClient');

const RECONNECT_INTERVAL = 5000; // Time in milliseconds to wait before attempting to reconnect

function initWebSocket() {
  let ws;

  function connect() {
    ws = new WebSocket(process.env.WEBSOCKET_SERVER_URL);
    logger.info(
      `WebSocket client connecting to ${process.env.WEBSOCKET_SERVER_URL}`
    );

    ws.on('open', async () => {
      logger.info('WebSocket connection established');

      // === Device handshake ===
      const deviceSerialNumber = (await readSerialNumber()) || 'Unknown';
      ws.send(
        JSON.stringify({
          type: 'DEVICE_CONNECT',
          serialNumber: deviceSerialNumber,
        })
      );
    });
    // === Response to the server ===
    ws.on('message', (message) => {
      handleMessage(ws, message);
    });

    ws.on('close', () => {
      logger.info('WebSocket connection closed. Attempting to reconnect...');
      setTimeout(connect, RECONNECT_INTERVAL);
    });

    ws.on('error', (error) => {
      logger.error(`WebSocket error: ${error.message}`);
      ws.close(); // Close the connection and trigger the reconnect logic
    });
  }
  ///
  connect(); // Initiate the first connection

  return ws;
}

module.exports = { initWebSocket };
