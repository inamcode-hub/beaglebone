const { createLogger, format, transports } = require('winston');
const path = require('path');

const logDirectory = path.join(__dirname, '../../logs');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(
      ({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`
    )
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(logDirectory, 'combined.log') }),
  ],
});

module.exports = logger;
