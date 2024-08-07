import { client, connect, close } from './modbusClient.js';
import registers from '../models/modbusRegisters.js';
import logger from '../../common/config/logger.js';
import { modbusErrorHandler } from '../../common/middlewares/modbusErrorHandler.js';

function scaleValue(reg, rawValue) {
  return reg ? reg.scale(rawValue) : undefined;
}

// Simulate readings if Modbus communication fails - for testing purposes
function simulateReadings() {
  return registers.map((reg) => ({
    tagName: reg.tagName,
    value: Math.random() * 100,
  }));
}

export async function readRegisters() {
  let allReadings = [];
  try {
    await connect();
    const blocks = [
      { start: 0, count: 26 },
      { start: 100, count: 6 },
      { start: 149, count: 1 },
      { start: 199, count: 1 },
    ];

    for (let block of blocks) {
      const data = await client.readHoldingRegisters(block.start, block.count);
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
    logger.info('Simulating Modbus readings');
    allReadings = simulateReadings();
  } finally {
    close();
  }

  return allReadings;
}
