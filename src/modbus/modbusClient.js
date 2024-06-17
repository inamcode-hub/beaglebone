// src/modbus/modbusClient.js

const ModbusRTU = require('modbus-serial');
const client = new ModbusRTU();

async function connect() {
  await client.connectRTUBuffered('/dev/ttyS2', {
    baudRate: 19200,
    parity: 'none',
    dataBits: 8,
    stopBits: 1,
  });
  client.setID(1);
  client.setTimeout(20000); // Increase the timeout value
}

async function close() {
  await client.close();
}

async function readRegisters(start, count) {
  return await client.readHoldingRegisters(start, count);
}

module.exports = {
  connect,
  close,
  readRegisters,
};
