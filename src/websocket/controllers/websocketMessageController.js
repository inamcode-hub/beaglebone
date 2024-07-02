import { readRegisters } from '../../modbus/services/modbusReadService.js';
import { writeRegister } from '../../modbus/services/modbusClient.js';
import { sendMessage } from '../utils/websocketUtils.js';
import MESSAGE_TYPES from '../constants/messageTypes.js';

export async function handleRequestSensorData(ws) {
  try {
    const data = await readRegisters();
    const serialNumber = data.find(
      (item) => item.tagName === 'systemSerialNumberWriteOnly'
    ).value;
    sendMessage(ws, MESSAGE_TYPES.SENSOR_DATA_RESPONSE, { serialNumber, data });
  } catch (error) {
    throw new Error(`Error handling REQUEST_SENSOR_DATA: ${error.message}`);
  }
}

export async function handleUpdateDeviceSettings(
  ws,
  { serialNumber, registerAddress, newValue }
) {
  try {
    const result = await writeRegister(registerAddress, newValue);
    sendMessage(ws, MESSAGE_TYPES.DEVICE_SETTINGS_UPDATE_ACK, {
      serialNumber,
      registerAddress: result.address,
      newValue: result.value,
    });
  } catch (error) {
    throw new Error(`Error handling UPDATE_DEVICE_SETTINGS: ${error.message}`);
  }
}
