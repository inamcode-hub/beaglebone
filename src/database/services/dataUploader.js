import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import logger from '../../common/config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
const uploadedDir = path.join(dataDir, 'uploaded');

if (!fs.existsSync(uploadedDir)) {
  fs.mkdirSync(uploadedDir);
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export function uploadDataToServer() {
  const dates = fs.readdirSync(dataDir).filter((dateDir) => {
    const fullPath = path.join(dataDir, dateDir);
    return fs.statSync(fullPath).isDirectory(); // Ensure it's a directory
  });

  dates.forEach((dateDir) => {
    const dailyDir = path.join(dataDir, dateDir);
    const files = fs.readdirSync(dailyDir).filter((file) => {
      const fullPath = path.join(dailyDir, file);
      return fs.statSync(fullPath).isFile(); // Ensure it's a file
    });

    if (files.length > 0) {
      let batchData = [];

      // Read and parse each file, then push its data into the batch array
      files.forEach((file) => {
        const filePath = path.join(dailyDir, file);
        const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        batchData.push(fileData);
      });

      const upload = (retryCount = 0) => {
        axios
          .post('https://www.dryersmaster.com/API/devices/upload', {
            data: batchData,
          })
          .then((response) => {
            logger.info(
              `Batch of ${files.length} files uploaded successfully: ${response.status}`
            );

            // Move all uploaded files to the uploaded directory
            const uploadedDirPath = path.join(uploadedDir, dateDir);
            if (!fs.existsSync(uploadedDirPath)) {
              fs.mkdirSync(uploadedDirPath, { recursive: true });
            }

            files.forEach((file) => {
              const filePath = path.join(dailyDir, file);
              fs.renameSync(filePath, path.join(uploadedDirPath, file));
            });

            // Clear batchData after successful upload
            batchData = [];
          })
          .catch((error) => {
            if (retryCount < MAX_RETRIES) {
              const delay = RETRY_DELAY * Math.pow(2, retryCount);
              logger.warn(
                `Retrying upload of batch (attempt ${
                  retryCount + 1
                }) after ${delay}ms...`
              );
              setTimeout(() => upload(retryCount + 1), delay);
            } else {
              logger.error(
                `Failed to upload batch after ${MAX_RETRIES} attempts: ${error.message}`
              );
            }
          });
      };

      upload();
    }
  });
}
