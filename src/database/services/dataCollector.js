import Sensor from '../models/sensorModel.js';
import logger from '../../common/config/logger.js';
import { getModbusData } from '../../modbus/controllers/modbusController.js';

export async function startCollectingData() {
  try {
    // Fetch data from the Modbus controller
    const modbusData = await getModbusData();

    const data = modbusData.reduce((acc, item) => {
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
}
