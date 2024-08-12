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
