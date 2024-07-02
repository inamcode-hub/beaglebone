import {
  getModbusData,
  updateModbusRegister,
} from '../../modbus/controllers/modbusController.js';
import { sendMessage, handleError } from '../utils/websocketUtils.js';
import MESSAGE_TYPES from '../constants/messageTypes.js';

async function handleRequestSensorData(ws) {
  try {
    const data = await getModbusData();
    const serialNumber = data.find(
      (item) => item.tagName === 'systemSerialNumberWriteOnly'
    ).value;
    sendMessage(ws, MESSAGE_TYPES.SENSOR_DATA_RESPONSE, { serialNumber, data });
  } catch (error) {
    handleError(ws, error);
  }
}

async function handleUpdateDeviceSettings(ws, message) {
  const { serialNumber, registerAddress, newValue } = message;
  try {
    const result = await updateModbusRegister(registerAddress, newValue);
    sendMessage(ws, MESSAGE_TYPES.DEVICE_SETTINGS_UPDATE_ACK, {
      serialNumber,
      registerAddress: result.address,
      newValue: result.value,
    });
  } catch (error) {
    handleError(ws, error);
  }
}

export async function handleMessage(ws, message) {
  try {
    const parsedMessage = JSON.parse(message);

    switch (parsedMessage.type) {
      case MESSAGE_TYPES.REQUEST_SENSOR_DATA:
        await handleRequestSensorData(ws);
        break;
      case MESSAGE_TYPES.UPDATE_DEVICE_SETTINGS:
        await handleUpdateDeviceSettings(ws, parsedMessage);
        break;
      default:
        console.warn(`Unknown message type: ${parsedMessage.type}`);
    }
  } catch (error) {
    handleError(ws, error);
  }
}
