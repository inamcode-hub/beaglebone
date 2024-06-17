const ModbusRTU = require('modbus-serial');
const logger = require('../config/logger');
const client = new ModbusRTU();

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

async function close() {
  try {
    await client.close();
    logger.info('Closed Modbus client');
  } catch (error) {
    if (error.message !== 'Port is not open') {
      logger.error(`Error closing Modbus client: ${error.message}`);
    }
  }
}

async function readRegisters(start, count) {
  return await client.readHoldingRegisters(start, count);
}

module.exports = {
  connect,
  close,
  readRegisters,
};
