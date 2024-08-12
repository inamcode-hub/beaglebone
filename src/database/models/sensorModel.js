import db from '../connect/db.js';

const Sensor = {
  /**
   * Create a new sensor data record in the database.
   * @param {Object} data - An object containing sensor data with tagNames as keys.
   * @param {Function} callback - A callback function to handle the response.
   */
  create: (data, callback) => {
    const sensorData = {
      data, // The sensor data object containing tagName-value pairs
      timestamp: new Date().toISOString(), // Timestamp for when the data was recorded
    };
    db.sensors.insert(sensorData, callback);
  },

  /**
   * Retrieve all sensor data records from the database.
   * @param {Function} callback - A callback function to handle the response.
   */
  getAll: (callback) => {
    db.sensors.find({}, callback);
  },

  /**
   * Remove all sensor data records from the database.
   * @param {Function} callback - A callback function to handle the response.
   */
  removeAll: (callback) => {
    db.sensors.remove({}, { multi: true }, callback);
  },

  /**
   * Delete sensor data records older than a specified date.
   * @param {Date} beforeDate - The date before which records should be deleted.
   * @param {Function} callback - A callback function to handle the response.
   */
  deleteOldRecords: (beforeDate, callback) => {
    db.sensors.remove(
      { timestamp: { $lt: beforeDate.toISOString() } },
      { multi: true },
      callback
    );
  },
};

export default Sensor;
