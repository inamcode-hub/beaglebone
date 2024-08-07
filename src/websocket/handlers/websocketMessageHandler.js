import {
  getModbusData,
  updateModbusRegister,
} from '../../modbus/controllers/modbusController.js';
import { sendMessage, handleError } from '../utils/websocketUtils.js';
import MESSAGE_TYPES from '../constants/messageTypes.js';
import { exec } from 'child_process';
import e from 'express';
import logger from '../../common/config/logger.js';
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

async function rebootDevice(ws) {
  try {
    const data = await getModbusData();
    const serialNumber = data.find(
      (item) => item.tagName === 'systemSerialNumberWriteOnly'
    ).value;
    // Sending successful reboot message
    sendMessage(ws, MESSAGE_TYPES.REBOOT_DEVICE_ACK, {
      serialNumber,
      success: true,
      message: 'Device reboot initiated successfully.',
    });
    logger.info(`Device reboot initiated successfully: ${serialNumber}`);
    // Execute the reboot script
    exec(
      'sudo /usr/local/bin/scripts/reboot-system.sh',
      (error, stdout, stderr) => {
        if (error) {
          logger.error(`Reboot error: ${error.message}`);
          sendMessage(ws, MESSAGE_TYPES.REBOOT_DEVICE_ACK, {
            serialNumber,
            success: false,
            error: 'Failed to reboot the device.',
            errorMessage: error.message,
          });
          return;
        }
        if (stderr) {
          logger.error(`Reboot stderr: ${stderr}`);
          sendMessage(ws, MESSAGE_TYPES.REBOOT_DEVICE_ACK, {
            serialNumber,
            success: false,
            error: 'Failed to reboot the device.',
            errorMessage: stderr,
          });
          return;
        }
      }
    );
  } catch (error) {
    sendMessage(ws, MESSAGE_TYPES.REBOOT_DEVICE_ACK, {
      serialNumber,
      success: false,
      error: 'Failed to reboot the device.',
      errorMessage: error.message,
    });
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
      case MESSAGE_TYPES.REBOOT_DEVICE:
        await rebootDevice(ws);
        break;
      default:
        console.warn(`Unknown message type: ${parsedMessage.type}`);
    }
  } catch (error) {
    handleError(ws, error);
  }
}
