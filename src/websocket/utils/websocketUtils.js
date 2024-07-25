import logger from '../../common/config/logger.js';

const Model = process.env.DEVICE_MODEL;
export function sendMessage(ws, type, data) {
  data.model = Model;
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
  logger.info(`Sent message to ${Model} WebSocket client: ${message}`);
}
export function handleError(ws, error) {
  const errorMessage = `WebSocket error: ${error.message}`;
  logger.error(errorMessage);
  ws.send(JSON.stringify({ type: 'ERROR', error: errorMessage }));
}
