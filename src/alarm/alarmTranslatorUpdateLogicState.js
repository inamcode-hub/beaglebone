import { alarmLogicState } from './alarmLogicState.js'; // Global state
import { processModbusAlarms } from './alarmTranslator.js'; // Function that gets active alarms

// Function to handle reading alarms, updating the global state, and adding timestamps
const readAlarmLogicState = () => {
  const activeAlarms = processModbusAlarms(); // Get the current active alarms
  const now = new Date(); // Current time as a Date object
  const nowISO = now.toISOString(); // ISO formatted string for timestamps

  // Iterate over all alarms in the global state
  Object.keys(alarmLogicState).forEach((alarmName) => {
    const globalState = alarmLogicState[alarmName];
    const activeAlarm = activeAlarms[alarmName]; // Check if the alarm is active
    const lastChecked = new Date(globalState.lastChecked); // Get the last checked time

    // Update `lastChecked` to the current time
    globalState.lastChecked = nowISO;

    if (activeAlarm) {
      activeAlarm.forEach((alarmState) => {
        const lastActiveTime = new Date(globalState.lastActive);
        const timeSinceLastActive = now - lastActiveTime; // Time difference in ms

        // Check if the last update was more than the debounce time ago
        if (timeSinceLastActive > globalState.debounceTime) {
          globalState.active = true; // Set active to true
          globalState.lastActive = nowISO; // Update the lastActive timestamp
          globalState.stage = alarmState.stage; // Update the stage

          // Log the update
          console.log(
            `Updated ${alarmName} - Stage: ${alarmState.stage}, Last Active: ${globalState.lastActive}`
          );
        }
      });
    } else {
      // Alarm is not active
      if (globalState.active) {
        // If it was active but now inactive, update `lastDeactivated`
        globalState.lastDeactivated = nowISO;
        globalState.active = false; // Set active to false

        // Log the deactivation
        console.log(
          `Deactivated ${alarmName} - Last Deactivated: ${globalState.lastDeactivated}`
        );
      }
    }
  });
};

export default readAlarmLogicState;
