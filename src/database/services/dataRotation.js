import Sensor from '../models/sensorModel.js';
import logger from '../../common/config/logger.js';

export function rotateOldData() {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  Sensor.deleteOldRecords(twoWeeksAgo, (err, numRemoved) => {
    if (err) {
      logger.error(`Failed to delete old sensor data: ${err.message}`);
    } else {
      logger.info(`Deleted ${numRemoved} old sensor records.`);
    }
  });
}
