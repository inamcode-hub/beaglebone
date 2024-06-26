// src/websocketHandler.js

const readRegister = require('../services/readRegister');
const modbusClient = require('../services/modbusClient');
const logger = require('../config/logger');

async function handleMessage(ws, message) {
  const parsedMessage = JSON.parse(message);

  switch (parsedMessage.type) {
    case 'REQUEST_SENSOR_DATA':
      await handleReadData(ws);
      break;
    case 'UPDATE_DEVICE_SETTINGS':
      await handleUpdateRegister(ws, parsedMessage);
      break;
    default:
      logger.warn('Unknown message type:', parsedMessage.type);
  }
}

async function handleReadData(ws) {
  try {
    const data = await readRegister();
    const serialNumber = data.find(
      (item) => item.tagName === 'systemSerialNumberWriteOnly'
    ).value;
    ws.send(
      JSON.stringify({ type: 'SENSOR_DATA_RESPONSE', serialNumber, data })
    );
  } catch (error) {
    logger.error(`Error handling DEVICE_CONNECT: ${error.message}`);
    ws.send(JSON.stringify({ type: 'ERROR', message: error.message }));
  }
}

async function handleUpdateRegister(ws, message) {
  const { serialNumber, registerAddress, newValue } = message;
  try {
    const result = await modbusClient.writeRegister(registerAddress, newValue);
    ws.send(
      JSON.stringify({
        type: 'DEVICE_SETTINGS_UPDATE_ACK',
        serialNumber,
        registerAddress: result.address,
        newValue: result.value,
      })
    );
  } catch (error) {
    logger.error(`Error handling UPDATE_DEVICE_SETTINGS: ${error.message}`);
    ws.send(JSON.stringify({ type: 'ERROR', message: error.message }));
  }
}

module.exports = { handleMessage };
