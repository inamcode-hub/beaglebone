import modbusClient from '../modbus/services/modbusClient.js';

// Function to interpret a single bit (0 or 1) as an alarm state and return only active alarms
const interpretAlarmState = (bitValue, alarmName, stage) => {
  if (bitValue === 1) {
    return `${alarmName} is at stage: ${stage}`;
  }
  return null;
};

// Function to decode the bits of the alarm state for Moisture and Temperature alarms
const translateMoistureAndTemperatureAlarm = (
  alarmValue,
  leftAlarmName,
  rightAlarmName
) => {
  const alarmStates = {};

  // Outlet (left side) alarms (Bits 7-4)
  const leftAlarmStates = [];
  const chiLeft = interpretAlarmState(
    (alarmValue >> 7) & 1,
    leftAlarmName,
    'CHI'
  );
  const cloLeft = interpretAlarmState(
    (alarmValue >> 6) & 1,
    leftAlarmName,
    'CLO'
  );
  const whiLeft = interpretAlarmState(
    (alarmValue >> 5) & 1,
    leftAlarmName,
    'WHI'
  );
  const wloLeft = interpretAlarmState(
    (alarmValue >> 4) & 1,
    leftAlarmName,
    'WLO'
  );

  [chiLeft, cloLeft, whiLeft, wloLeft].forEach((state) => {
    if (state) leftAlarmStates.push(state);
  });

  // Inlet (right side) alarms (Bits 3-0)
  const rightAlarmStates = [];
  const chiRight = interpretAlarmState(
    (alarmValue >> 3) & 1,
    rightAlarmName,
    'CHI'
  );
  const cloRight = interpretAlarmState(
    (alarmValue >> 2) & 1,
    rightAlarmName,
    'CLO'
  );
  const whiRight = interpretAlarmState(
    (alarmValue >> 1) & 1,
    rightAlarmName,
    'WHI'
  );
  const wloRight = interpretAlarmState(
    (alarmValue >> 0) & 1,
    rightAlarmName,
    'WLO'
  );

  [chiRight, cloRight, whiRight, wloRight].forEach((state) => {
    if (state) rightAlarmStates.push(state);
  });

  // Add to alarmStates only if there are active alarms
  if (leftAlarmStates.length > 0) {
    alarmStates[leftAlarmName] = leftAlarmStates;
  }
  if (rightAlarmStates.length > 0) {
    alarmStates[rightAlarmName] = rightAlarmStates;
  }

  return alarmStates;
};

// Function to handle discharge and burner alarms with the updated mapping
const translateDischargeAndBurnerAlarm = (alarmValue) => {
  const alarmStates = {};

  const dischargeAlarmStates = [];
  const burnerTemperatureAlarmStates = [];

  // BurnerTemperatureAlarm (Bits 8-5)
  const chiBurner = interpretAlarmState(
    (alarmValue >> 8) & 1,
    'burnerTemperatureAlarm',
    'CHI'
  );
  const cloBurner = interpretAlarmState(
    (alarmValue >> 7) & 1,
    'burnerTemperatureAlarm',
    'CLO'
  );
  const wloBurner = interpretAlarmState(
    (alarmValue >> 6) & 1,
    'burnerTemperatureAlarm',
    'WLO'
  );
  const dryerOff = interpretAlarmState(
    (alarmValue >> 5) & 1,
    'burnerTemperatureAlarm',
    'DryerOff'
  );

  [chiBurner, cloBurner, wloBurner, dryerOff].forEach((state) => {
    if (state) burnerTemperatureAlarmStates.push(state);
  });

  // DischargeRateAlarm (Bits 4-1)
  const chiDischarge = interpretAlarmState(
    (alarmValue >> 4) & 1,
    'dischargeRateAlarm',
    'CHI'
  );
  const cloDischarge = interpretAlarmState(
    (alarmValue >> 3) & 1,
    'dischargeRateAlarm',
    'CLO'
  );
  const whiDischarge = interpretAlarmState(
    (alarmValue >> 2) & 1,
    'dischargeRateAlarm',
    'WHI'
  );
  const wloDischarge = interpretAlarmState(
    (alarmValue >> 1) & 1,
    'dischargeRateAlarm',
    'WLO'
  );

  [chiDischarge, cloDischarge, whiDischarge, wloDischarge].forEach((state) => {
    if (state) dischargeAlarmStates.push(state);
  });

  // Add to alarmStates if there are active alarms
  if (burnerTemperatureAlarmStates.length > 0) {
    alarmStates['burnerTemperatureAlarm'] = burnerTemperatureAlarmStates;
  }
  if (dischargeAlarmStates.length > 0) {
    alarmStates['dischargeRateAlarm'] = dischargeAlarmStates;
  }

  return alarmStates;
};

// Process all alarms from the Modbus client data
const translateAllAlarmsFromData = (modbusData) => {
  const alarms = {};

  const moistureAlarmData = modbusData.find(
    (r) => r.tagName === 'inletAndOutletMoistureAlarmStates'
  );
  const temperatureAlarmData = modbusData.find(
    (r) => r.tagName === 'inletAndOutletTemperatureAlarmStates'
  );
  const dischargeAlarmData = modbusData.find(
    (r) => r.tagName === 'dischargeAlarmStates'
  );

  console.log('Received Alarm Data:');
  if (moistureAlarmData) {
    console.log(
      `Tag: ${moistureAlarmData.tagName}, Value: ${moistureAlarmData.value}`
    );
  }
  if (temperatureAlarmData) {
    console.log(
      `Tag: ${temperatureAlarmData.tagName}, Value: ${temperatureAlarmData.value}`
    );
  }
  if (dischargeAlarmData) {
    console.log(
      `Tag: ${dischargeAlarmData.tagName}, Value: ${dischargeAlarmData.value}`
    );
  }

  if (moistureAlarmData) {
    const moistureAlarms = translateMoistureAndTemperatureAlarm(
      moistureAlarmData.value,
      'outletMoistureAlarm',
      'inletMoistureAlarm'
    );
    Object.assign(alarms, moistureAlarms);
  }

  if (temperatureAlarmData) {
    const temperatureAlarms = translateMoistureAndTemperatureAlarm(
      temperatureAlarmData.value,
      'outletTemperatureAlarm',
      'inletTemperatureAlarm'
    );
    Object.assign(alarms, temperatureAlarms);
  }

  if (dischargeAlarmData) {
    const dischargeAndBurnerAlarms = translateDischargeAndBurnerAlarm(
      dischargeAlarmData.value
    );
    Object.assign(alarms, dischargeAndBurnerAlarms);
  }

  return alarms;
};

// Exported function to process modbusClient alarms
export const processModbusAlarms = () => {
  const modbusData = modbusClient.currentData;

  if (!modbusData || modbusData.length === 0) {
    console.error('No modbus data available.');
    return null;
  }

  const activeAlarms = translateAllAlarmsFromData(modbusData);

  if (Object.keys(activeAlarms).length > 0) {
    console.log('================== ALARM STATES ==================');
    console.log('Active alarms:', activeAlarms);
    console.log('==================================================');
  } else {
    console.log('================== ALARM STATES ==================');
    console.log('No active alarms.');
    console.log('==================================================');
  }

  return activeAlarms;
};
