import Datastore from 'nedb';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../../common/config/logger.js';
import { startCollectingData } from '../services/dataCollector.js';
import { rotateOldData } from '../services/dataRotation.js';
import { uploadDataToServer } from '../services/dataUploader.js';

// Manually define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the sensors database
const sensorsDb = new Datastore({
  filename: path.join(__dirname, '../data/sensors.db'),
  autoload: true,
});

const db = {
  sensors: sensorsDb,
};

export const dbConnect = () => {
  // Load the database and start operations
  db.sensors.loadDatabase((err) => {
    if (err) {
      logger.error(`Failed to load database: ${err.message}`);
    } else {
      logger.info('Database connected and loaded.');

      // Start collecting sensor data
      startCollectingData();

      // Rotate old data every 24 hours
      setInterval(() => {
        rotateOldData();
      }, 24 * 60 * 60 * 1000); // Every 24 hours

      // Upload data to the server every hour
      setInterval(() => {
        uploadDataToServer();
      }, 60 * 60 * 1000); // Every hour
    }
  });
};

export default db;
