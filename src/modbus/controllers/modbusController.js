import { readRegisters } from '../services/modbusReadService.js';
import { writeRegister } from '../services/modbusClient.js';

export async function getModbusData() {
  try {
    const data = await readRegisters();
    return data;
  } catch (error) {
    throw new Error(`Error reading Modbus data: ${error.message}`);
  }
}

export async function updateModbusRegister(registerAddress, newValue) {
  try {
    const result = await writeRegister(registerAddress, newValue);
    return result;
  } catch (error) {
    throw new Error(`Error writing to Modbus register: ${error.message}`);
  }
}
