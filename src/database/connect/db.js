import { startCollectingData } from '../services/dataCollector.js';
import { uploadDataToServer } from '../services/dataUploader.js';
import { rotateOldData } from '../services/dataRotation.js';
import logger from '../../common/config/logger.js';

let dataCollectorInterval;
let dataUploaderInterval;
let dataRotationInterval;

export const dbConnect = () => {
  logger.info('Starting data collection tasks...');

  // Collect data every second
  dataCollectorInterval = setInterval(() => {
    try {
      startCollectingData();
    } catch (error) {
      console.error('Error in data collection:', error);
    }
  }, 1000); // Every 1 second

  // Upload data every hour
  dataUploaderInterval = setInterval(() => {
    try {
      uploadDataToServer();
      logger.info('Uploading data...');
    } catch (error) {
      logger.error('Error in data upload:', error);
    }
  }, 60 * 60 * 1000); // Every 1 hour

  // Rotate (delete) data older than 14 days every 24 hours
  dataRotationInterval = setInterval(() => {
    try {
      rotateOldData();
      logger.info('Rotating old data...');
    } catch (error) {
      logger.error('Error in data rotation:', error);
    }
  }, 24 * 60 * 60 * 1000); // Every 24 hours
};

// Graceful shutdown and clearing intervals
process.on('SIGINT', () => {
  logger.info('Gracefully shutting down...');
  clearInterval(dataCollectorInterval);
  clearInterval(dataUploaderInterval);
  clearInterval(dataRotationInterval);
  logger.info('Intervals cleared. Exiting process.');
  process.exit();
});
