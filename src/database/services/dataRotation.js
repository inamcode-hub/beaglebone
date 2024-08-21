import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../../common/config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
const uploadedDir = path.join(dataDir, 'uploaded');

export function rotateOldData() {
  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - 1); // Set to 1 day ago

  const deleteOldDirectories = (directory) => {
    const dates = fs.readdirSync(directory).filter((dateDir) => {
      const fullPath = path.join(directory, dateDir);
      return fs.statSync(fullPath).isDirectory();
    });

    dates.forEach((dateDir) => {
      const fileDate = new Date(dateDir);
      if (fileDate < oldDate) {
        const dailyDir = path.join(directory, dateDir);
        fs.rmdirSync(dailyDir, { recursive: true });
        logger.info(`Deleted old data directory: ${dailyDir}`);
      }
    });
  };

  // Delete old directories from both main dataDir and uploadedDir
  deleteOldDirectories(dataDir); // Deletes un-uploaded data
  if (fs.existsSync(uploadedDir)) {
    deleteOldDirectories(uploadedDir); // Deletes uploaded data
  }
}
