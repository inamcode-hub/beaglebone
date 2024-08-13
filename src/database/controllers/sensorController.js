import Sensor from '../models/sensorModel.js';

export const createSensorData = (req, res) => {
  const sensorData = {
    name: req.body.name, // Sensor name
    value: req.body.value, // Sensor value
  };

  Sensor.create(sensorData, (err, newSensorData) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(newSensorData);
  });
};

export const getSensorData = (req, res) => {
  Sensor.getAll((err, sensorData) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(sensorData);
  });
};

export const getMostRecentSensorData = (req, res) => {
  Sensor.getMostRecent((err, sensorData) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (sensorData.length === 0) {
      return res.status(404).json({ message: 'No sensor data found' });
    }
    res.json(sensorData[0]);
  });
};
