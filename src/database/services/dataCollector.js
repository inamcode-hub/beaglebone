import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getModbusData } from '../../modbus/controllers/modbusController.js';
import logger from '../../common/config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');

// Buffer to hold data for averaging
let buffer = [];
let lastValues = {};

const fieldsToAverage = [
  'inletMoisture',
  'outletMoistureAverage',
  'inletProductTemperature',
  'outletProductTemperatureAverage',
  'airPlenumTemperature',
  'dischargeRateIn',
  'dmRateOutput',
];

export async function startCollectingData() {
  try {
    const modbusData = await getModbusData();

    // Extract the necessary data for averaging and last value tracking
    const data = {};
    modbusData.forEach((item) => {
      if (fieldsToAverage.includes(item.tagName)) {
        if (!buffer[item.tagName]) {
          buffer[item.tagName] = [];
        }
        buffer[item.tagName].push(item.value);
      } else {
        lastValues[item.tagName] = item.value;
      }
    });

    // Check if one minute has passed
    if (buffer['inletMoisture'] && buffer['inletMoisture'].length >= 60) {
      const averagedData = {};

      // Calculate averages for the required fields
      fieldsToAverage.forEach((field) => {
        const sum = buffer[field].reduce((acc, value) => acc + value, 0);
        averagedData[field] = sum / buffer[field].length;
      });

      // Combine averaged data and the last recorded values
      const finalData = { ...averagedData, ...lastValues };

      // Add the timestamp
      const timestamp = new Date().toISOString();
      const sensorEntry = { timestamp, data: finalData };

      // Store the data on disk
      const dateStr = timestamp.split('T')[0]; // YYYY-MM-DD
      const dailyDir = path.join(dataDir, dateStr);

      if (!fs.existsSync(dailyDir)) {
        fs.mkdirSync(dailyDir, { recursive: true });
      }

      const timeStr = timestamp.split('T')[1].split('.')[0].replace(/:/g, '-'); // HH-MM-SS
      const filePath = path.join(dailyDir, `${timeStr}.json`);

      fs.writeFileSync(filePath, JSON.stringify(sensorEntry), 'utf8');
      logger.info(`Averaged sensor data recorded at ${timestamp}`);

      // Reset the buffer for the next minute
      buffer = [];
    }
  } catch (error) {
    logger.error(`Error in collecting sensor data: ${error.message}`);
  }
}
