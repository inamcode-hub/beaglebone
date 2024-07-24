import ModbusRTU from 'modbus-serial';
import logger from '../../common/config/logger.js';
import { modbusErrorHandler } from '../../common/middlewares/modbusErrorHandler.js';

const client = new ModbusRTU();

async function connect() {
  try {
    if (!client.isOpen) {
      logger.info('Attempting to connect to Modbus client');
      await client.connectRTUBuffered('/dev/ttyS2', {
        baudRate: 19200,
        parity: 'none',
        dataBits: 8,
        stopBits: 1,
      });
      client.setID(1);
      client.setTimeout(20000);
      logger.info('Modbus client connected successfully to /dev/ttyS2');
    } else {
      logger.info('Modbus client is already connected');
    }
  } catch (error) {
    throw modbusErrorHandler(error, 'Modbus connect');
  }
}

function close() {
  try {
    if (client.isOpen) {
      client.close();
      logger.info('Closed Modbus client');
    } else {
      logger.info('Modbus client was already closed');
    }
  } catch (error) {
    logger.error(`Error closing Modbus client: ${error.message}`);
  }
}

async function readRegisters() {
  try {
    await connect();
    const data = await client.readHoldingRegisters(0, 10);
    logger.info(`Read registers data: ${JSON.stringify(data)}`);
    close();
    return data;
  } catch (error) {
    close();
    throw modbusErrorHandler(error, 'Modbus readRegisters');
  }
}

async function readSerialNumber() {
  try {
    await connect();
    const data = await client.readHoldingRegisters(149, 1);
    logger.info(`Read serial number data: ${JSON.stringify(data.data[0])}`);
    close();
    return data.data[0];
  } catch (error) {
    close();
    throw modbusErrorHandler(error, 'Modbus readSerialNumber');
  }
}

async function writeRegister(registerAddress, value) {
  try {
    logger.info(
      `Attempting to write to register ${registerAddress} with value ${value}`
    );
    await connect();
    const result = await client.writeRegister(registerAddress, value);
    logger.info(`Register ${result.address} updated to ${result.value}`);
    close();
    return result;
  } catch (error) {
    close();
    throw modbusErrorHandler(error, 'Modbus writeRegister');
  }
}

export {
  client,
  connect,
  close,
  readRegisters,
  readSerialNumber,
  writeRegister,
};
