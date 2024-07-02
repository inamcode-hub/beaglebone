import WebSocket, { WebSocketServer } from 'ws';
import logger from '../common/config/logger.js';
import { handleMessage } from './handlers/websocketMessageHandler.js';
import { handleError } from './utils/websocketUtils.js';

export function initWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    logger.info('WebSocket server connection established');

    ws.on('message', (message) => {
      handleMessage(ws, message).catch((error) => handleError(ws, error));
    });

    ws.on('close', () => {
      logger.info('WebSocket server connection closed');
    });

    ws.on('error', (error) => {
      handleError(ws, error);
    });
  });

  return wss;
}
