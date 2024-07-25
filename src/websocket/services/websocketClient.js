import WebSocket from 'ws';
import dns from 'dns';
import util from 'util';
import logger from '../../common/config/logger.js';
import { readSerialNumber } from '../../modbus/services/modbusClient.js';
import { handleMessage } from '../handlers/websocketMessageHandler.js';
import { sendMessage, handleError } from '../utils/websocketUtils.js';
import MESSAGE_TYPES from '../constants/messageTypes.js';

const RECONNECT_INTERVAL = 5000;
const HEARTBEAT_INTERVAL = 10000; // Send ping every 10 seconds
const HEARTBEAT_TIMEOUT = 15000; // Wait 15 seconds for pong
const CONNECTION_TIMEOUT = 10000; // Wait 10 seconds for connection establishment

let ws;
let heartbeatTimeout;
let heartbeatInterval;
let reconnectTimeout;
let connectionTimeout;
let deviceSerialNumber = 'Unknown';
let reconnectAttempts = 0;

export async function initWebSocketClient() {
  deviceSerialNumber = await initializeSerialNumber();
  connect();
}

async function initializeSerialNumber() {
  try {
    const serialNumber = await readSerialNumber();
    logger.info(`Device serial number initialized: ${serialNumber}`);
    return serialNumber;
  } catch (error) {
    logger.error(`Failed to read serial number: ${error.message}`);
    return 'Unknown';
  }
}

function sendPing() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    logger.info('Sending PING to server');
    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPES.PING,
        data: {
          serialNumber: deviceSerialNumber,
          model: process.env.DEVICE_MODEL || 'UnknownModel',
        },
      })
    );
    heartbeatTimeout = setTimeout(() => {
      logger.error('No PONG received within timeout. Terminating connection.');
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
  reconnectAttempts += 1;
  if (reconnectAttempts > 5) {
    logger.warn(
      `Multiple reconnect attempts (${reconnectAttempts}), waiting longer before next attempt`
    );
    reconnectTimeout = setTimeout(connect, RECONNECT_INTERVAL * 2);
    reconnectAttempts = 0;
  } else {
    reconnectTimeout = setTimeout(connect, RECONNECT_INTERVAL);
  }
}

async function connect() {
  try {
    ws = new WebSocket(process.env.WEBSOCKET_SERVER_URL);
    logger.info(
      `WebSocket client connecting to ${process.env.WEBSOCKET_SERVER_URL}`
    );

    setupConnectionTimeout();
    setupWebSocketEventHandlers();
  } catch (error) {
    handleErrorDuringConnection(error);
  }
}

function setupConnectionTimeout() {
  connectionTimeout = setTimeout(() => {
    if (ws.readyState !== WebSocket.OPEN) {
      logger.error('Connection attempt timed out. Retrying...');
      ws.terminate();
      attemptReconnect();
    }
  }, CONNECTION_TIMEOUT);
}

function setupWebSocketEventHandlers() {
  ws.on('open', onOpen);
  ws.on('message', onMessage);
  ws.on('close', onClose);
  ws.on('error', onError);
}

async function onOpen() {
  logger.info('WebSocket connection established');
  clearConnectionTimeout();
  reconnectAttempts = 0;
  await initializeSerialNumber();
  const ipAddress = process.env.HOST_IP || 'Unknown';
  const publicIpAddress = process.env.PUBLIC_IP || 'Unknown';
  sendMessage(ws, MESSAGE_TYPES.DEVICE_CONNECT, {
    serialNumber: deviceSerialNumber || 'Unknown',
    model: process.env.DEVICE_MODEL || 'DM510',
    ipAddress: ipAddress,
    publicIpAddress: publicIpAddress,
  });
  clearHeartbeat();
  heartbeatInterval = setInterval(sendPing, HEARTBEAT_INTERVAL);
}

function onMessage(message) {
  const parsedMessage = JSON.parse(message);
  if (parsedMessage.type === MESSAGE_TYPES.PONG) {
    logger.info('Received PONG from server');
    clearTimeout(heartbeatTimeout);
  } else {
    handleMessage(ws, message).catch((error) => handleError(ws, error));
  }
}

function onClose() {
  logger.info('WebSocket connection closed. Attempting to reconnect...');
  attemptReconnect();
}

function onError(error) {
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
}

function handleErrorDuringConnection(error) {
  logger.error(`WebSocket connection error: ${error.message}`);
  handleError(ws, error);
  attemptReconnect();
}
