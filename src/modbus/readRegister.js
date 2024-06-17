// src/modbus/readRegister.js

const logger = require('../config/logger');
const modbusClient = require('./modbusClient');
const registers = require('./registers');

// Helper function to scale read values
function scaleValue(reg, rawValue) {
  return reg ? reg.scale(rawValue) : undefined;
}

// Function to generate random values for simulation
function generateRandomValue(scaleFunction) {
  const randomValue = Math.random() * 100;
  return scaleFunction(randomValue);
}

// Function to simulate Modbus readings
function simulateReadings() {
  logger.info('Simulating Modbus readings');
  return registers.map((register) => ({
    tagName: register.tagName,
    value: generateRandomValue(register.scale),
  }));
}

// Function to perform actual Modbus communication
async function performModbusCommunication() {
  let allReadings = [];

  try {
    await modbusClient.connect();
    logger.info('Modbus client connected successfully');

    const blocks = [
      { start: 0, count: 26 }, // Covers registers at addresses 0-26
      { start: 100, count: 6 }, // Covers registers at addresses 99-106
      { start: 149, count: 1 }, // Covers registers at address 149
      { start: 199, count: 1 }, // Covers registers at address 199
    ];

    for (let block of blocks) {
      const data = await modbusClient.readRegisters(block.start, block.count);
      for (let i = 0; i < block.count; i++) {
        const reg = registers.find((r) => r.address === block.start + i);
        if (reg) {
          const rawValue = data.data[i];
          const scaledValue = scaleValue(reg, rawValue);
          allReadings.push({ tagName: reg.tagName, value: scaledValue });
        }
      }
    }
  } catch (error) {
    logger.error(`Error during Modbus communication: ${error.message}`);
  } finally {
    try {
      await modbusClient.close();
      logger.info('Closed Modbus client');
    } catch (error) {
      logger.error(`Error closing Modbus client: ${error.message}`);
    }
  }

  return allReadings;
}

// Main function to read Modbus registers
async function readRegister() {
  if (process.env.MODE === 'development') {
    return simulateReadings();
  } else {
    return await performModbusCommunication();
  }
}

module.exports = readRegister;
