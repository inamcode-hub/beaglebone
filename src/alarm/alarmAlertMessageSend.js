import { alarmLogicState } from './alarmLogicState.js'; // Global state

// Function to send alarm message to the server (console.log for now)
const sendAlarmMessageToServer = (alarmName, stage) => {
  console.log(
    `Sending alarm ${alarmName} with stage ${stage} to the server...`
  );
};

// Function to check alarms and send messages
const alarmAlertMessageSend = () => {
  const now = new Date(); // Current timestamp

  Object.keys(alarmLogicState).forEach((alarmName) => {
    const globalState = alarmLogicState[alarmName];

    // Add a flag to track if the alarm was previously inactive
    if (globalState.wasPreviouslyInactive === undefined) {
      globalState.wasPreviouslyInactive = true; // Initialize if it doesn't exist
    }

    // Check if the alarm has reactivated (was inactive, now active)
    if (globalState.active && globalState.wasPreviouslyInactive) {
      // Reset serverAck, autoAck, and retries if the alarm is active again after being inactive
      globalState.serverAck = false;
      globalState.autoAck = false;
      globalState.sentRetries = 0;
      globalState.wasPreviouslyInactive = false; // Mark that the alarm is now active

      // Log the reactivation
      console.log(
        `Alarm ${alarmName} reactivated, resetting acknowledgments and retries.`
      );
    }

    // If the alarm is not active, mark it as previously inactive
    if (!globalState.active) {
      globalState.wasPreviouslyInactive = true;
    }

    // Only proceed if the alarm is active and not acknowledged
    if (globalState.active && !globalState.serverAck && !globalState.autoAck) {
      const lastSentTime = new Date(globalState.lastSentToServer);
      const timeSinceLastSent = now - lastSentTime; // Time since the last message was sent

      // If no retries or enough time has passed since the last retry
      if (globalState.sentRetries === 0 || timeSinceLastSent > 5000) {
        if (globalState.sentRetries < 3) {
          // Send the alarm message to the server
          sendAlarmMessageToServer(alarmName, globalState.stage);

          // Update the state to reflect the message was sent
          globalState.lastSentToServer = now.toISOString();
          globalState.sentRetries += 1; // Increment the retry count

          // Log the retry
          console.log(`Retry ${globalState.sentRetries} for ${alarmName}`);
        } else {
          // If 3 retries have been reached, set autoAck to true
          globalState.autoAck = true;
          globalState.sentRetries = 0; // Reset retries

          // Log auto acknowledgment
          console.log(`${alarmName} auto-acknowledged after 3 retries.`);
        }
      }
    }
  });
};

export default alarmAlertMessageSend;
