import Sensor from '../models/sensorModel.js';
import logger from '../../common/config/logger.js';

export function rotateOldData() {
  const oldDate = new Date();
  oldDate.setSeconds(oldDate.getSeconds() - 20); // Set to 20 seconds ago

  Sensor.deleteOldRecords(oldDate, (err, numRemoved) => {
    if (err) {
      logger.error(`Failed to delete old sensor data: ${err.message}`);
    } else {
      logger.info(`Deleted ${numRemoved} old sensor records.`);
    }
  });
}
