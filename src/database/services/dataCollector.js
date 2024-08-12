import Sensor from '../models/sensorModel.js';
import logger from '../../common/config/logger.js';

export function startCollectingData() {
  setInterval(() => {
    const sensorData = {
      name: 'Temperature Sensor',
      value: Math.random() * 100, // Random value for demo
    };

    Sensor.create(sensorData, (err, newSensorData) => {
      if (err) {
        logger.error(`Failed to record sensor data: ${err.message}`);
      } else {
        logger.info(`Recorded sensor data: ${JSON.stringify(newSensorData)}`);
      }
    });
  }, 1000); // Record data every second
}
