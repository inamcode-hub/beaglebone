import { sendMessage } from '../websocket/utils/websocketUtils.js';
import MESSAGE_TYPES from '../websocket/constants/messageTypes.js';
import logger from '../common/config/logger.js';
import { processModbusAlarms } from './helpers.js';

let alarmStates = {
  inlet: { active: false, stage: null, retries: 0, lastSent: null },
  outlet: { active: false, stage: null, retries: 0, lastSent: null },
  dryingTemp: { active: false, stage: null, retries: 0, lastSent: null },
};

const MAX_RETRIES = 3;
const ALARM_DEBOUNCE_INTERVAL = 10000; // 10 seconds
let isWebSocketConnected = true;
let isProcessingAlarms = false; // New flag to prevent multiple calls

// Function to throttle alarm checks
const throttleAlarmChecks = () => {
  if (isProcessingAlarms) {
    return;
  }
  isProcessingAlarms = true;

  setTimeout(() => {
    isProcessingAlarms = false;
  }, ALARM_DEBOUNCE_INTERVAL);
};

// Simulating sensor data for testing
function getSensorData(sensorType) {
  const activeAlarms = processModbusAlarms();
  const baseValues = { inlet: 90, outlet: 15, dryingTemp: 160 };
  const fluctuation = Math.random() * 10 - 5;
  const sensorData = baseValues[sensorType] + fluctuation;
  return sensorData;
}

function checkInletAlarm() {
  const inletSensorData = getSensorData('inlet');
  return inletSensorData > 92 ? 'hwl' : inletSensorData > 85 ? 'lwl' : null;
}

function checkOutletAlarm() {
  const outletSensorData = getSensorData('outlet');
  return outletSensorData < 13 ? 'lal' : outletSensorData < 18 ? 'hal' : null;
}

function checkDryingTempAlarm() {
  const dryingTempData = getSensorData('dryingTemp');
  return dryingTempData > 165 ? 'hwl' : dryingTempData > 155 ? 'lwl' : null;
}

export function checkAlarmCondition(ws) {
  if (!ws || !isWebSocketConnected) {
    logger.warn('WebSocket is not connected. Pausing alarms.');
    return;
  }

  throttleAlarmChecks(); // Ensure alarms are not checked too frequently

  const alarms = getAlarmStates();
  for (const [alarmName, alarm] of Object.entries(alarms)) {
    if (
      alarm.stage &&
      !alarmStates[alarmName].active &&
      Date.now() - alarmStates[alarmName].lastSent > ALARM_DEBOUNCE_INTERVAL
    ) {
      sendAlarm(ws, alarmName, alarm.stage);
      alarmStates[alarmName].active = true;
      alarmStates[alarmName].stage = alarm.stage;
      alarmStates[alarmName].retries = 0;
      alarmStates[alarmName].lastSent = Date.now();
    } else if (alarmStates[alarmName].active && !alarm.stage) {
      logger.info(`Alarm ${alarmName} resolved.`);
      alarmStates[alarmName].active = false;
      alarmStates[alarmName].stage = null;
      alarmStates[alarmName].retries = 0;
    }
  }
}

function getAlarmStates() {
  return {
    inlet: { stage: checkInletAlarm() },
    outlet: { stage: checkOutletAlarm() },
    dryingTemp: { stage: checkDryingTempAlarm() },
  };
}

function sendAlarm(ws, alarmName, stage) {
  const alarmMessage = {
    alarmType: alarmName,
    stage: stage,
    timestamp: new Date().toISOString(),
  };

  logger.info(`Sending alarm: ${alarmName} at stage: ${stage}`);
  sendMessage(ws, MESSAGE_TYPES.ALARM_TRIGGER, alarmMessage);

  alarmStates[alarmName].lastSent = Date.now();

  alarmStates[alarmName].ackTimeout = setTimeout(() => {
    if (
      alarmStates[alarmName].retries < MAX_RETRIES &&
      alarmStates[alarmName].active
    ) {
      alarmStates[alarmName].retries++;
      logger.warn(
        `Retrying alarm: ${alarmName}, attempt ${alarmStates[alarmName].retries}`
      );
      sendMessage(ws, MESSAGE_TYPES.ALARM_TRIGGER, alarmMessage);
    } else if (alarmStates[alarmName].retries >= MAX_RETRIES) {
      logger.error(`Max retries reached for ${alarmName}. Giving up.`);
    }
  }, 5000);
}

export function handleAlarmAck(message) {
  const { alarmType, ackReceived } = message;
  if (ackReceived && alarmStates[alarmType]?.active) {
    logger.info(`Acknowledgment received for alarm: ${alarmType}`);
    alarmStates[alarmType].retries = 0;
    clearTimeout(alarmStates[alarmType].ackTimeout);
    alarmStates[alarmType].active = false;
  }
}

// Called when WebSocket connection drops
export function handleConnectionDrop() {
  isWebSocketConnected = false;
  logger.warn('WebSocket connection dropped. Pausing alarm handling.');
}

// Called when WebSocket reconnects
export function handleReconnection(ws) {
  isWebSocketConnected = true;
  logger.info('WebSocket connection re-established. Resuming alarm handling.');
  checkAlarmCondition(ws); // Recheck alarms on reconnection
}
