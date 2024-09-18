import { intervals } from './alarmLogicState.js';
import readAlarmLogicState from './alarmTranslatorUpdateLogicState.js';

// Function to start alarm polling
const startAlarmPolling = (ws) => {
  console.log('===============================');
  console.log('startAlarmPolling');
  console.log('===============================');
  setInterval(() => {
    // console.log('interval ');
    readAlarmLogicState();
  }, intervals.translateAndUpdateGlobalState);
  console.log('===============================');
  console.log('===============================');
};
// Stop polling when the WebSocket disconnects
const stopAlarmPolling = () => {
  console.log('===============================');
  console.log('stopAlarmPolling');
  console.log('===============================');
};

export { startAlarmPolling, stopAlarmPolling };
