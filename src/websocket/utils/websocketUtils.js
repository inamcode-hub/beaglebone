import logger from '../../common/config/logger.js';

export function sendMessage(ws, type, data) {
  data.model = process.env.DEVICE_MODEL;
  data.ipAddress = process.env.HOST_IP;
  data.publicIpAddress = process.env.PUBLIC_IP;
  if (!data.serialNumber) {
    data.serialNumber = process.env.PUBLIC_IP;
    logger.warn(
      `Serial number not provided. Using public IP address: ${data.serialNumber}`
    );
  }
  const message = JSON.stringify({ type, data });
  ws.send(message);
  logger.info(`Sent message to ${data.model} WebSocket client: ${message}`);
}
export function handleError(ws, error) {
  const errorMessage = `WebSocket error: ${error.message}`;
  logger.error(errorMessage);
  ws.send(JSON.stringify({ type: 'ERROR', error: errorMessage }));
}
