const scalePercentage = (value) => value / 100;
const scaleTemperature = (value) => value / 100;
const scaleRate = (value) => value / 100;
const noScale = (value) => value; // For data that doesn't need scaling

const registers = [
  { address: 0, tagName: 'inletMoisture', scale: scalePercentage },
  { address: 1, tagName: 'outletMoistureAverage', scale: scalePercentage },
  { address: 4, tagName: 'inletProductTemperature', scale: scaleTemperature },
  {
    address: 5,
    tagName: 'outletProductTemperatureAverage',
    scale: scaleTemperature,
  },
  { address: 8, tagName: 'airPlenumTemperature', scale: scaleTemperature },
  { address: 9, tagName: 'dischargeRateIn', scale: scaleRate },
  { address: 10, tagName: 'dmRateOutput', scale: scaleRate },
  { address: 11, tagName: 'notReadyReason', scale: noScale },
  { address: 12, tagName: 'aliveBit', scale: noScale },
  { address: 13, tagName: 'controlMode', scale: noScale },
  { address: 14, tagName: 'localRemoteMode', scale: noScale },
  { address: 15, tagName: 'systemMode', scale: noScale },
  { address: 17, tagName: 'targetMoisture', scale: scalePercentage },
  { address: 18, tagName: 'currentProductNumber', scale: noScale },
  { address: 19, tagName: 'controllerState', scale: noScale },
  { address: 20, tagName: 'modelPredictedMoisture', scale: scalePercentage },
  { address: 21, tagName: 'autoFirstLoad', scale: noScale },
  { address: 22, tagName: 'modelSuggestedRate', scale: scaleRate },
  { address: 23, tagName: 'inletAndOutletMoistureAlarmStates', scale: noScale },
  {
    address: 24,
    tagName: 'inletAndOutletTemperatureAlarmStates',
    scale: noScale,
  },
  { address: 25, tagName: 'dischargeAlarmStates', scale: noScale },
  {
    address: 100,
    tagName: 'operatorDischargeSetpointWriteOnly',
    scale: noScale,
  },
  { address: 101, tagName: 'controlModeRequestWriteOnly', scale: noScale },
  { address: 102, tagName: 'remoteModeRequestWriteOnly', scale: noScale },
  { address: 103, tagName: 'targetMoistureWriteOnly', scale: noScale },
  { address: 104, tagName: 'newProductNumberWriteOnly', scale: noScale },
  { address: 105, tagName: 'remoteDryerShutdownWriteOnly', scale: noScale },
  { address: 149, tagName: 'systemSerialNumberWriteOnly', scale: noScale },
  { address: 199, tagName: 'heartbeatRegisterWriteOnly', scale: noScale },
];

export default registers;
