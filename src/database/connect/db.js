import { startCollectingData } from '../services/dataCollector.js';
import { uploadDataToServer } from '../services/dataUploader.js';
import { rotateOldData } from '../services/dataRotation.js';

export const dbConnect = () => {
  // Collect data every second
  setInterval(() => {
    startCollectingData();
  }, 1000); // Every 1 second

  // Upload data every hour
  setInterval(() => {
    uploadDataToServer();
  }, 60 * 60 * 1000); // Every 1 hour

  // Rotate (delete) data older than 14 days
  setInterval(() => {
    rotateOldData();
  }, 24 * 60 * 60 * 1000); // Every 24 hours
};
