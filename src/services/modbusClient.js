const ModbusRTU = require('modbus-serial');
const client = new ModbusRTU();
const logger = require('../config/logger');

async function connect() {
  try {
    await client.connectRTUBuffered('/dev/ttyS2', {
      baudRate: 19200,
      parity: 'none',
      dataBits: 8,
      stopBits: 1,
    });
    client.setID(1);
    client.setTimeout(20000);
    logger.info('Modbus client connected successfully to /dev/ttyS2');
  } catch (error) {
    logger.error(`Error during Modbus communication: ${error.message}`);
    throw error;
  }
}

function close() {
  try {
    if (client.isOpen) {
      client.close();
      logger.info('Closed Modbus client');
    }
  } catch (error) {
    logger.error(`Error closing Modbus client: ${error.message}`);
  }
}

module.exports = { client, connect, close };
