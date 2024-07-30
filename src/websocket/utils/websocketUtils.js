import os from 'os';
import fs from 'fs';
import { execSync } from 'child_process';
import WebSocket from 'ws';
import logger from '../../common/config/logger.js';

export function sendMessage(ws, type, data = {}) {
  try {
    // Gather additional system information
    const cpuUsage = os.loadavg();
    const memoryUsage = {
      total: os.totalmem(),
      free: os.freemem(),
    };
    const networkInterfaces = os.networkInterfaces();
    const runningProcesses = fs
      .readdirSync('/proc')
      .filter((pid) => /^\d+$/.test(pid)).length; // Example for Linux

    // Get disk usage information using the df command
    const diskPath = '/'; // Path to the root filesystem
    let diskUsageInfo = {};
    try {
      const dfOutput = execSync(`df -k ${diskPath}`).toString();
      const lines = dfOutput.split('\n');
      const diskData = lines[1].split(/\s+/);
      const total = parseInt(diskData[1], 10) * 1024;
      const free = parseInt(diskData[3], 10) * 1024;
      diskUsageInfo = { total, free };
    } catch (err) {
      logger.error(`Error getting disk usage: ${err.message}`);
      diskUsageInfo = { total: 0, free: 0 };
    }

    // Default data object with essential fields
    const essentialData = {
      model: process.env.DEVICE_MODEL || 'UnknownModel',
      publicIpAddress: process.env.PUBLIC_IP || 'UnknownPublicIP',
      beagleboneSerialNumber:
        process.env.BEAGLEBONE_SERIAL_NUMBER || 'UnknownBeagleBoneSerial',
    };

    // Additional data for DEVICE_CONNECT type
    const additionalData = {
      ipAddress: process.env.HOST_IP || 'UnknownIP',
      deviceStatus: 'online',
      uptime: process.uptime(),
      cpuUsage,
      memoryUsage,
      diskUsage: diskUsageInfo,
      networkInterfaces,
      runningProcesses,
      firmwareVersion: process.env.FIRMWARE_VERSION || 'UnknownVersion',
    };

    // Merge incoming data with essentialData
    let messageData = { ...essentialData, ...data };

    // Add additional data if the type is DEVICE_CONNECT
    if (type === 'DEVICE_CONNECT') {
      messageData = { ...messageData, ...additionalData };
    }

    // Ensure serial number is set or use the BeagleBone serial number as a fallback
    if (!messageData.serialNumber) {
      messageData.serialNumber = messageData.beagleboneSerialNumber;
      logger.warn(
        `Serial number not provided. Using BeagleBone serial number: ${messageData.serialNumber}`
      );
    }

    // Construct the message
    const message = JSON.stringify({ type, data: messageData });

    // Send the message if the WebSocket is open
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
      logger.info(
        `Sent message to ${messageData.model} WebSocket client: ${message}`
      );
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
