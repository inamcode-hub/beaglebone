import { intervals } from './alarmLogicState.js'; // Use global state for intervals
import readAlarmLogicState from './alarmTranslatorUpdateLogicState.js';
import alarmAlertMessageSend from './alarmAlertMessageSend.js'; // Include the alarm message send logic
import logger from '../common/config/logger.js';

// Function to start alarm polling
const startAlarmPolling = (ws) => {
  logger.info('starting alarm polling...');

  // Polling to update the alarm state
  setInterval(() => {
    // Update the alarm logic state from the translator
    readAlarmLogicState();
  }, intervals.translateAndUpdateGlobalState);

  // Polling to send alarm alerts (using the global interval for sending alerts)
  setInterval(() => {
    // Trigger the function to send alarms to the server
    alarmAlertMessageSend(ws);
  }, intervals.sendAlarmAlerts); // Using the global interval for sending alarm alerts
};

// Stop polling when the WebSocket disconnects
const stopAlarmPolling = () => {
  logger.info('stop alarm polling...');
};

export { startAlarmPolling, stopAlarmPolling };
