import { alarmLogicState } from './alarmLogicState.js'; // Import the global state

// Function to update the acknowledgment state for a specific alarm
export const updateAlarmAckState = (alarmName) => {
  if (alarmLogicState[alarmName]) {
    alarmLogicState[alarmName].serverAck = true; // Set serverAck to true
    console.log(
      `Acknowledgment for ${alarmName} received. Updated serverAck to true.`
    );
  } else {
    console.log(`Alarm ${alarmName} does not exist in the global state.`);
  }
};
