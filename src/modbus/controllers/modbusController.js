import { readRegisters } from '../services/modbusReadService.js';
import { writeRegister } from '../services/modbusClient.js';
import modbusQueue from '../services/modbusQueue.js'; // Import the queue

export async function getModbusData() {
  return new Promise((resolve, reject) => {
    modbusQueue.addToQueue(async () => {
      try {
        const data = await readRegisters();
        resolve(data);
      } catch (error) {
        reject(new Error(`Error reading Modbus data: ${error.message}`));
      }
    });
  });
}

export async function updateModbusRegister(registerAddress, newValue) {
  return new Promise((resolve, reject) => {
    modbusQueue.addToQueue(async () => {
      try {
        const result = await writeRegister(registerAddress, newValue);
        resolve(result);
      } catch (error) {
        reject(new Error(`Error writing to Modbus register: ${error.message}`));
      }
    });
  });
}
