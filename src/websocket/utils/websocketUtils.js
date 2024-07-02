import logger from '../../common/config/logger.js';

export function sendMessage(ws, type, data) {
  const message = JSON.stringify({ type, data });
  ws.send(message);
  logger.info(`Sent message: ${message}`);
}

export function handleError(ws, error) {
  const errorMessage = `WebSocket error: ${error.message}`;
  logger.error(errorMessage);
  ws.send(JSON.stringify({ type: 'ERROR', error: errorMessage }));
}
