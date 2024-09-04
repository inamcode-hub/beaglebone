import path from 'path';
import fs from 'fs';
import { createLogger, format, transports } from 'winston';
import { fileURLToPath } from 'url';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize } = format;

// Get the current file's directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Absolute path for logging directory (using /var/log/myapp)
const logDirectory = '/var/log/myapp';

// Ensure the log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Create the logger
const logger = createLogger({
  level: 'debug',
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.Console({
      format: combine(colorize(), timestamp(), logFormat),
    }),
    // Rotate log files daily
    new transports.DailyRotateFile({
      filename: path.join(logDirectory, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m', // Maximum size before rotating
      maxFiles: '14d', // Keep logs for 14 days
    }),
    new transports.DailyRotateFile({
      filename: path.join(logDirectory, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m', // Maximum size before rotating
      maxFiles: '14d', // Keep logs for 14 days
    }),
  ],
});

// Log when a file is opened
const fileTransport = new transports.DailyRotateFile({
  filename: path.join(logDirectory, 'combined-%DATE%.log'),
});

fileTransport.on('open', () => {
  console.log('Log file opened for writing:', fileTransport.filename);
});

fileTransport.on('error', (err) => {
  console.error('Error writing to log file:', err);
});

export default logger;
