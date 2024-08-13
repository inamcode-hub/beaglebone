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