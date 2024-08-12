import express from 'express';
import {
  createSensorData,
  getSensorData,
} from '../controllers/sensorController.js';

const router = express.Router();

// Route to create sensor data
router.post('/sensor', createSensorData);

// Route to get all sensor data
router.get('/sensors', getSensorData);

export default router;
