# Database Setup and Data Management Guide

This guide covers the setup and management of the database, including data collection, uploading data to a remote server, handling large files, and data rotation.

## 1. Database Initialization

### `db.js`

The `db.js` file is responsible for initializing the database and starting all data-related processes. It handles:

- **Loading the database** when the application starts.
- **Starting data collection** at regular intervals.
- **Rotating old data** every 24 hours.
- **Uploading data** to a remote server every hour.

#### Code:

```javascript
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
```

## 2. Data Collection

### `dataCollector.js`

This service is responsible for collecting sensor data at regular intervals. The data is recorded in the local database every second.

#### Code:

```javascript
import Sensor from '../models/sensorModel.js';
import logger from '../../common/config/logger.js';

export function startCollectingData() {
  setInterval(() => {
    const sensorData = {
      name: 'Temperature Sensor',
      value: Math.random() * 100, // Random value for demo
      timestamp: new Date().toISOString(),
    };

    Sensor.create(sensorData, (err, newSensorData) => {
      if (err) {
        logger.error(`Failed to record sensor data: ${err.message}`);
      } else {
        logger.info(`Recorded sensor data: ${JSON.stringify(newSensorData)}`);
      }
    });
  }, 1000); // Every 1 second
}
```

## 3. Data Rotation

### `dataRotation.js`

This service handles the deletion of old data. Records older than two weeks are deleted every 24 hours.

#### Code:

```javascript
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
```

## 4. Data Upload

### `dataUploader.js`

This service is responsible for uploading data to a remote server every hour. After a successful upload, the data is removed from the local database.

#### Code:

```javascript
import axios from 'axios';
import Sensor from '../models/sensorModel.js';
import logger from '../../common/config/logger.js';

const MAX_CHUNK_SIZE = 1024 * 1024; // 1MB in bytes

export function uploadDataToServer() {
  // Fetch all sensor data from the database
  Sensor.getAll((err, sensorData) => {
    if (err) {
      logger.error(`Failed to fetch sensor data: ${err.message}`);
      return;
    }

    if (sensorData.length === 0) {
      logger.info('No sensor data to upload.');
      return;
    }

    // Convert the sensor data to JSON string for easier size calculation
    const jsonData = JSON.stringify(sensorData);
    const totalSize = Buffer.byteLength(jsonData, 'utf8');

    // Split data into chunks if it exceeds the max size limit
    const numChunks = Math.ceil(totalSize / MAX_CHUNK_SIZE);
    let chunks = [];

    for (let i = 0; i < numChunks; i++) {
      const start = i * MAX_CHUNK_SIZE;
      const end = start + MAX_CHUNK_SIZE;
      chunks.push(jsonData.slice(start, end));
    }

    // Upload each chunk sequentially
    const uploadChunk = (chunkIndex) => {
      if (chunkIndex >= chunks.length) {
        logger.info('All chunks uploaded successfully.');

        // After all chunks are uploaded, delete the data from the database
        Sensor.removeAll((err, numRemoved) => {
          if (err) {
            logger.error(
              `Failed to remove sensor data after upload: ${err.message}`
            );
          } else {
            logger.info(
              `Removed ${numRemoved} sensor records after successful upload.`
            );
          }
        });
        return;
      }

      // Upload the current chunk
      axios
        .post('http://yourserver.com/api/upload', { data: chunks[chunkIndex] })
        .then((response) => {
          logger.info(
            `Chunk ${chunkIndex + 1} uploaded successfully: ${response.status}`
          );
          uploadChunk(chunkIndex + 1); // Upload the next chunk
        })
        .catch((error) => {
          logger.error(
            `Failed to upload chunk ${chunkIndex + 1}: ${error.message}`
          );
        });
    };

    uploadChunk(0); // Start uploading from the first chunk
  });
}
```

## 5. Running the Application

### `index.js`

The main application file where the database connection and services are initialized.

#### Code:

```javascript
import { dbConnect } from './database/connect/db.js'; // Initialize the database

// Use the sensor routes
app.use('/api', sensorRoutes);
app.listen(port, () => {
  dbConnect(); // Initialize the database and start collecting data
});
```

## Conclusion

This guide covers the basic setup for database management, including data collection, rotation, uploading to a remote server, and handling large files. The system is designed to be lightweight and robust, with modular components that can be easily extended or modified.