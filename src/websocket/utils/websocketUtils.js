import WebSocket from 'ws';
import logger from '../../common/config/logger.js';

export function sendMessage(ws, type, data = {}) {
  try {
    // Ensure data object has required fields
    data.model = data.model || process.env.DEVICE_MODEL;
    data.ipAddress = data.ipAddress || process.env.HOST_IP;
    data.publicIpAddress = data.publicIpAddress || process.env.PUBLIC_IP;

    // Ensure serial number is set or use the public IP as a fallback
    if (!data.serialNumber) {
      data.serialNumber = process.env.PUBLIC_IP;
      logger.warn(
        `Serial number not provided. Using public IP address as serial number: ${data.serialNumber}`
      );
    }

    // Construct the message
    const message = JSON.stringify({ type, data });

    // Send the message if the WebSocket is open
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
      logger.info(`Sent message to ${data.model} WebSocket client: ${message}`);
    } else {
      logger.error('WebSocket is not open. Unable to send message.');
    }
  } catch (error) {
    handleError(ws, error);
  }
}

export function handleError(ws, error) {
  const errorMessage = `WebSocket error: ${error.message}`;
  logger.error(errorMessage);
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ERROR', error: errorMessage }));
  } else {
    logger.error('WebSocket is not open. Unable to send error message.');
  }
}
