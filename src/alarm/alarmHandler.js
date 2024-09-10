import { sendMessage } from '../websocket/utils/websocketUtils.js';
import MESSAGE_TYPES from '../websocket/constants/messageTypes.js';
import logger from '../common/config/logger.js';

let lastAlarmTimestamp = null;

export function checkAlarmCondition(ws) {
  logger.info('Starting checking alarm conditions...');
  // Example condition: replace this with your actual condition logic
  const conditionMet = checkYourConditionHere();

  if (conditionMet) {
    const currentTime = new Date().toISOString();

    // Avoid sending alarms too frequently
    if (!lastAlarmTimestamp || Date.now() - lastAlarmTimestamp > 5000) {
      // 5 seconds delay
      const alarmMessage = {
        alarmType: 'HighTemperature', // Example
        timestamp: currentTime,
      };

      // Send alarm message to the server
      logger.info(
        `Sending alarm: ${alarmMessage.alarmType} at ${alarmMessage.timestamp}`
      );
      sendMessage(ws, MESSAGE_TYPES.ALARM_TRIGGER, alarmMessage);

      // Update last alarm time
      lastAlarmTimestamp = Date.now();
    }
  }
}

function checkYourConditionHere() {
  // Replace this with the logic you need to check (e.g., temperature threshold, etc.)
  const sensorData = getSensorData();
  return sensorData && sensorData.temperature > 100; // Example condition
}

function getSensorData() {
  // Mock function to get sensor data; replace with actual logic
  return {
    temperature: 105, // Example value
  };
}
