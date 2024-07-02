import logger from '../config/logger.js';

function logErrors(err, req, res, next) {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );
  next(err);
}

function errorHandler(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
    },
  });
}

export { logErrors, errorHandler };
