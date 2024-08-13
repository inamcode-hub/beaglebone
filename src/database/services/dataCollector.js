import Sensor from '../models/sensorModel.js';
import logger from '../../common/config/logger.js';
import { getModbusData } from '../../modbus/controllers/modbusController.js';

/**
 * Starts the process of collecting sensor data at regular intervals.
 * Data is retrieved from the Modbus controller, processed, and saved to the database.
 */
export async function startCollectingData() {
  setInterval(async () => {
    try {
      // Fetch data from the Modbus controller
      const modbusData = await getModbusData();

      // Filter out "write only" values and transform the array into an object
      const data = modbusData
        // .filter((item) => !item.tagName.endsWith('WriteOnly'))
        .reduce((acc, item) => {
          acc[item.tagName] = item.value;
          return acc;
        }, {});

      // Record the processed data in the database
      Sensor.create(data, (err, newSensorData) => {
        if (err) {
          logger.error(`Failed to record sensor data: ${err.message}`);
        } else {
          // logger.info(`Recorded sensor data: ${JSON.stringify(newSensorData)}`);
        }
      });
    } catch (error) {
      logger.error(`Error in collecting sensor data: ${error.message}`);
    }
  }, 1000); // Record data every second
}
