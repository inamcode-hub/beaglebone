import logger from '../common/config/logger.js';
import { alarmLogicState } from './alarmLogicState.js'; // Import the global state

// Function to update the acknowledgment state for a specific alarm
export const updateAlarmAckState = (parsedMessage) => {
  const { alarmType, timestamp } = parsedMessage;

  logger.info('Received ALARM_ACK from server:', parsedMessage);

  if (alarmLogicState[alarmType]) {
    const alarmState = alarmLogicState[alarmType];

    // Check if the timestamp matches the lastActive time
    if (alarmState.lastActive === timestamp) {
      alarmState.serverAck = true; // Set serverAck to true if timestamp matches
      logger.info(
        `Acknowledgment for ${alarmType} received. Updated serverAck to true.`
      );
    } else {
      console.info(
        `Timestamp mismatch for ${alarmType}. No update to serverAck.`
      );
    }
  } else {
    console.warn(`Alarm ${alarmType} does not exist in the global state.`);
  }
};
