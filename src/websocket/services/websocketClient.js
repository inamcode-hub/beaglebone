import WebSocket from 'ws';
import logger from '../../common/config/logger.js';
import { readSerialNumber } from '../../modbus/services/modbusClient.js';
import { handleMessage } from '../handlers/websocketMessageHandler.js';
import { sendMessage, handleError } from '../utils/websocketUtils.js';
import MESSAGE_TYPES from '../constants/messageTypes.js';

const RECONNECT_INTERVAL = 5000;

export function initWebSocketClient() {
  let ws;

  async function connect() {
    try {
      ws = new WebSocket(process.env.WEBSOCKET_SERVER_URL);
      logger.info(
        `WebSocket client connecting to ${process.env.WEBSOCKET_SERVER_URL}`
      );
      ws.on('open', async () => {
        logger.info('WebSocket connection established');
        try {
          const deviceSerialNumber = await readSerialNumber();
          sendMessage(ws, MESSAGE_TYPES.DEVICE_CONNECT, {
            serialNumber: deviceSerialNumber || 'Unknown',
          });
        } catch (error) {
          handleError(ws, error);
        }
      });

      ws.on('message', (message) => {
        handleMessage(ws, message).catch((error) => handleError(ws, error));
      });

      ws.on('close', () => {
        logger.info('WebSocket connection closed. Attempting to reconnect...');
        setTimeout(connect, RECONNECT_INTERVAL);
      });

      ws.on('error', (error) => {
        handleError(ws, error);
      });
    } catch (error) {
      handleError(ws, error);
      setTimeout(connect, RECONNECT_INTERVAL);
    }
  }

  connect();
}
