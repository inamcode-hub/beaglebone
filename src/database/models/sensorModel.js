import db from '../connect/db.js';
import { v4 as uuidv4 } from 'uuid';

const Sensor = {
  create: (data, callback) => {
    const sensorData = {
      id: uuidv4(), // Unique ID
      name: data.name, // Sensor name
      value: data.value, // Sensor value
      timestamp: new Date().toISOString(), // Timestamp
    };
    db.sensors.insert(sensorData, callback);
  },

  getAll: (callback) => {
    db.sensors.find({}, callback);
  },

  removeAll: (callback) => {
    db.sensors.remove({}, { multi: true }, callback);
  },

  deleteOldRecords: (beforeDate, callback) => {
    db.sensors.remove(
      { timestamp: { $lt: beforeDate.toISOString() } },
      { multi: true },
      callback
    );
  },
};

export default Sensor;
