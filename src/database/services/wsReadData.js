import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../../common/config/logger.js';

//===============how to call this function================
// const data = wsReadData();
// console.log(`Data: ${JSON.stringify(data, null, 2)}`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');

const fieldsToAverage = [
  'inletMoisture',
  'outletMoistureAverage',
  'inletProductTemperature',
  'outletProductTemperatureAverage',
  'airPlenumTemperature',
  'dischargeRateIn',
  'dmRateOutput',
];

// Helper function to calculate averages for the specified fields
function calculateAverages(dataBuffer) {
  const averagedData = {};

  fieldsToAverage.forEach((field) => {
    const values = dataBuffer.map((entry) => entry.data[field] || 0);
    const sum = values.reduce((acc, value) => acc + value, 0);
    averagedData[field] = values.length > 0 ? sum / values.length : 0;
  });

  return averagedData;
}

// Main function to read data and return averaged intervals
function wsReadData(hours = 24, averageInterval = 10) {
  try {
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000); // Calculate the start time

    logger.info(
      `Reading data from the last ${hours} hours with a ${averageInterval}-minute average.`
    );

    let dataBuffer = [];
    let lastValues = {};

    // Read and filter directories by the time range
    const directories = fs.readdirSync(dataDir).filter((dir) => {
      const dirDate = new Date(dir);
      return dirDate >= startTime && dirDate <= now;
    });

    // Collect data from valid directories
    directories.forEach((dateDir) => {
      const dailyDir = path.join(dataDir, dateDir);
      const files = fs
        .readdirSync(dailyDir)
        .filter((file) => file.endsWith('.json'));

      files.forEach((file) => {
        const filePath = path.join(dailyDir, file);
        const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        dataBuffer.push(fileData);

        // Track the last values for non-averaged fields
        Object.keys(fileData.data).forEach((key) => {
          if (!fieldsToAverage.includes(key)) {
            lastValues[key] = fileData.data[key];
          }
        });
      });
    });

    logger.info(`Total data points collected: ${dataBuffer.length}`);

    if (dataBuffer.length === 0) {
      logger.warn(`No data points found for the given time range.`);
      return [];
    }

    // Group data by the specified interval (in minutes)
    const intervalCount = Math.ceil((hours * 60) / averageInterval);
    const filesPerInterval = Math.ceil(dataBuffer.length / intervalCount);

    let averagedIntervals = [];
    for (let i = 0; i < intervalCount; i++) {
      const intervalData = dataBuffer.slice(
        i * filesPerInterval,
        (i + 1) * filesPerInterval
      );

      if (intervalData.length > 0) {
        const averagedData = calculateAverages(intervalData);
        averagedIntervals.push({ ...averagedData, ...lastValues });
      }
    }

    logger.info(`Averaged ${averagedIntervals.length} intervals.`);
    return averagedIntervals;
  } catch (error) {
    logger.error(`Error in wsReadData: ${error.message}`);
    return [];
  }
}

export default wsReadData;
