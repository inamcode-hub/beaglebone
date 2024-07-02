import logger from '../config/logger.js';

function logModbusErrors(error, context = '') {
  logger.error(`${error.status || 500} - ${error.message} - ${context}`);
}

function modbusErrorHandler(error, context = '') {
  logModbusErrors(error, context);
  const err = new Error(`${error.status || 500} - ${error.message}`);
  err.status = error.status || 500;
  return err;
}

export { logModbusErrors, modbusErrorHandler };
