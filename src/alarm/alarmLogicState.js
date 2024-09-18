const intervals = {
  translateAndUpdateGlobalState: 3000,
  sendAlarmAlerts: 1000,
};
const stage = {
  1: 'lwl',
  2: 'hwl',
  3: 'lal',
  4: 'hal',
};
const alarmLogicState = {
  inletMoistureAlarm: {
    active: false,
    lastActive: '2021-01-01T00:00:00.000Z', // When the alarm was last activated
    lastDeactivated: '2021-01-01T00:00:00.000Z', // When the alarm was last deactivated
    lastChecked: '2021-01-01T00:00:00.000Z', // Last time this alarm state was checked
    debounceTime: 5000, // Debounce time in milliseconds
    stage: '', // Current stage of the alarm
    lastSentToServer: '2021-01-01T00:00:00.000Z', // When the last alarm was sent to the server
    sentRetries: 0,
    serverAck: false,
    autoAck: false,
  },
  outletMoistureAlarm: {
    active: false,
    lastActive: '2021-01-01T00:00:00.000Z', // When the alarm was last activated
    lastDeactivated: '2021-01-01T00:00:00.000Z', // When the alarm was last deactivated
    lastChecked: '2021-01-01T00:00:00.000Z', // Last time this alarm state was checked
    debounceTime: 5000, // Debounce time in milliseconds
    stage: '', // Current stage of the alarm
    lastSentToServer: '2021-01-01T00:00:00.000Z', // When the last alarm was sent to the server
    sentRetries: 0,
    serverAck: false,
    autoAck: false,
  },
  inletTemperatureAlarm: {
    active: false,
    lastActive: '2021-01-01T00:00:00.000Z', // When the alarm was last activated
    lastDeactivated: '2021-01-01T00:00:00.000Z', // When the alarm was last deactivated
    lastChecked: '2021-01-01T00:00:00.000Z', // Last time this alarm state was checked
    debounceTime: 5000, // Debounce time in milliseconds
    stage: '', // Current stage of the alarm
    lastSentToServer: '2021-01-01T00:00:00.000Z', // When the last alarm was sent to the server
    sentRetries: 0,
    serverAck: false,
    autoAck: false,
  },
  outletTemperatureAlarm: {
    active: false,
    lastActive: '2021-01-01T00:00:00.000Z', // When the alarm was last activated
    lastDeactivated: '2021-01-01T00:00:00.000Z', // When the alarm was last deactivated
    lastChecked: '2021-01-01T00:00:00.000Z', // Last time this alarm state was checked
    debounceTime: 5000, // Debounce time in milliseconds
    stage: '', // Current stage of the alarm
    lastSentToServer: '2021-01-01T00:00:00.000Z', // When the last alarm was sent to the server
    sentRetries: 0,
    serverAck: false,
    autoAck: false,
  },
  burnerTemperatureAlarm: {
    active: false,
    lastActive: '2021-01-01T00:00:00.000Z', // When the alarm was last activated
    lastDeactivated: '2021-01-01T00:00:00.000Z', // When the alarm was last deactivated
    lastChecked: '2021-01-01T00:00:00.000Z', // Last time this alarm state was checked
    debounceTime: 5000, // Debounce time in milliseconds
    stage: '', // Current stage of the alarm
    lastSentToServer: '2021-01-01T00:00:00.000Z', // When the last alarm was sent to the server
    sentRetries: 0,
    serverAck: false,
    autoAck: false,
  },
  dischargeRateAlarm: {
    active: false,
    lastActive: '2021-01-01T00:00:00.000Z', // When the alarm was last activated
    lastDeactivated: '2021-01-01T00:00:00.000Z', // When the alarm was last deactivated
    lastChecked: '2021-01-01T00:00:00.000Z', // Last time this alarm state was checked
    debounceTime: 5000, // Debounce time in milliseconds
    stage: '', // Current stage of the alarm
    lastSentToServer: '2021-01-01T00:00:00.000Z', // When the last alarm was sent to the server
    sentRetries: 0,
    serverAck: false,
    autoAck: false,
  },
};

export { intervals, stage, alarmLogicState };
