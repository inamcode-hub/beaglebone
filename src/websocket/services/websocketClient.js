import WebSocket from 'ws';
import logger from '../../common/config/logger.js';
import { readSerialNumber } from '../../modbus/services/modbusClient.js';
import { handleMessage } from '../handlers/websocketMessageHandler.js';
import { sendMessage, handleError } from '../utils/websocketUtils.js';
import MESSAGE_TYPES from '../constants/messageTypes.js';

const RECONNECT_INTERVAL = 5000;
const HEARTBEAT_INTERVAL = 10000; // Send ping every 10 seconds
const HEARTBEAT_TIMEOUT = 15000; // Wait 15 seconds for pong
const CONNECTION_TIMEOUT = 10000; // Wait 10 seconds for connection establishment

export function initWebSocketClient() {
  let ws;
  let heartbeatTimeout;
  let heartbeatInterval;
  let reconnectTimeout;
  let connectionTimeout;
  let deviceSerialNumber = 'Unknown';

  async function initializeSerialNumber() {
    try {
      deviceSerialNumber = await readSerialNumber();
      logger.info(`Device serial number initialized: ${deviceSerialNumber}`);
    } catch (error) {
      logger.error(`Failed to read serial number: ${error.message}`);
    }
  }

  function sendPing() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      logger.info('Sending PING to server');
      ws.send(
        JSON.stringify({
          type: MESSAGE_TYPES.PING,
          data: { serialNumber: deviceSerialNumber, model: 'DM510' },
        })
      );
      heartbeatTimeout = setTimeout(() => {
        logger.error(
          'No PONG received within timeout. Terminating connection.'
        );
        ws.terminate();
      }, HEARTBEAT_TIMEOUT);
    }
  }

  function clearHeartbeat() {
    if (heartbeatTimeout) {
      clearTimeout(heartbeatTimeout);
      heartbeatTimeout = null;
    }
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  function clearConnectionTimeout() {
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      connectionTimeout = null;
    }
  }

  function attemptReconnect() {
    clearHeartbeat();
    clearConnectionTimeout();
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    reconnectTimeout = setTimeout(connect, RECONNECT_INTERVAL);
  }

  async function connect() {
    try {
      ws = new WebSocket(process.env.WEBSOCKET_SERVER_URL);
      logger.info(
        `WebSocket client connecting to ${process.env.WEBSOCKET_SERVER_URL}`
      );

      connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          logger.error('Connection attempt timed out. Retrying...');
          ws.terminate();
          attemptReconnect();
        }
      }, CONNECTION_TIMEOUT);

      ws.on('open', async () => {
        logger.info('WebSocket connection established');
        clearConnectionTimeout();
        await initializeSerialNumber();
        sendMessage(ws, MESSAGE_TYPES.DEVICE_CONNECT, {
          serialNumber: deviceSerialNumber || 'Unknown',
          model: 'DM510',
        });
        clearHeartbeat();
        heartbeatInterval = setInterval(sendPing, HEARTBEAT_INTERVAL); // Start sending pings
      });

      ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === MESSAGE_TYPES.PONG) {
          logger.info('Received PONG from server');
          clearTimeout(heartbeatTimeout);
        } else {
          handleMessage(ws, message).catch((error) => handleError(ws, error));
        }
      });

      ws.on('close', () => {
        logger.info('WebSocket connection closed. Attempting to reconnect...');
        attemptReconnect();
      });

      ws.on('error', (error) => {
        logger.error(`WebSocket error: ${error.message}`);
        handleError(ws, error);
        if (
          ws.readyState !== WebSocket.CLOSED &&
          ws.readyState !== WebSocket.CLOSING
        ) {
          ws.close();
        } else {
          attemptReconnect();
        }
      });
    } catch (error) {
      logger.error(`WebSocket connection error: ${error.message}`);
      handleError(ws, error);
      attemptReconnect();
    }
  }

  connect();
}
