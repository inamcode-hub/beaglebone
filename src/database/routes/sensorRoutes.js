import express from 'express';
import {
  createSensorData,
  getSensorData,
  getMostRecentSensorData, // Import the new controller function
} from '../controllers/sensorController.js';

const router = express.Router();

// Route to create sensor data
router.post('/sensor', createSensorData);

// Route to get all sensor data
router.get('/sensors', getSensorData);

// Route to get the most recent sensor data
router.get('/sensor/recent', getMostRecentSensorData);

export default router;
