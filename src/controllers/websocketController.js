// src/websocketHandler.js

const readRegister = require('../services/readRegister');
const modbusClient = require('../services/modbusClient');
const logger = require('../config/logger');

async function handleMessage(ws, message) {
  const parsedMessage = JSON.parse(message);

  switch (parsedMessage.type) {
    case 'READ_DATA':
      await handleReadData(ws);
      break;
    case 'UPDATE_REGISTER':
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
    ws.send(JSON.stringify({ type: 'DATA_RESPONSE', serialNumber, data }));
  } catch (error) {
    logger.error(`Error handling READ_DATA: ${error.message}`);
    ws.send(JSON.stringify({ type: 'ERROR', message: error.message }));
  }
}

async function handleUpdateRegister(ws, message) {
  const { serialNumber, registerAddress, newValue } = message;
  try {
    const result = await modbusClient.writeRegister(registerAddress, newValue);
    ws.send(
      JSON.stringify({
        type: 'UPDATE_ACK',
        serialNumber,
        registerAddress: result.address,
        newValue: result.value,
      })
    );
  } catch (error) {
    logger.error(`Error handling UPDATE_REGISTER: ${error.message}`);
    ws.send(JSON.stringify({ type: 'ERROR', message: error.message }));
  }
}

module.exports = { handleMessage };
