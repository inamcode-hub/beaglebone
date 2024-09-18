import { alarmLogicState } from './alarmLogicState.js'; // Import the global state

// Function to update the acknowledgment state for a specific alarm
export const updateAlarmAckState = (parsedMessage) => {
  const { alarmType, timestamp } = parsedMessage;

  console.log('Received ALARM_ACK from server:', parsedMessage);

  if (alarmLogicState[alarmType]) {
    const alarmState = alarmLogicState[alarmType];

    // Check if the timestamp matches the lastActive time
    if (alarmState.lastActive === timestamp) {
      alarmState.serverAck = true; // Set serverAck to true if timestamp matches
      console.log(
        `Acknowledgment for ${alarmType} received. Updated serverAck to true.`
      );
    } else {
      console.log(
        `Timestamp mismatch for ${alarmType}. No update to serverAck.`
      );
    }
  } else {
    console.log(`Alarm ${alarmType} does not exist in the global state.`);
  }
};
