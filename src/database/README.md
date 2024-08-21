# File-Based Data Management System Guide

This guide details the setup and management of the file-based data management system, including data collection, uploading data to a remote server, handling large files, and data rotation.

## 1. Directory Structure and Initialization

### `dbConnect.js`

The `dbConnect.js` file is the central point for initializing the system. It is responsible for starting all key processes, such as data collection, rotation of old data, and uploading collected data to a remote server. These operations are scheduled at regular intervals:

- **Data Collection**: This runs every second, gathering sensor data.
- **Data Rotation**: This process runs every 24 hours, deleting data older than 7 days.
- **Data Upload**: Data is uploaded to the server every hour to ensure timely backups.

## 2. Data Collection

### `dataCollector.js`

The `dataCollector.js` service is tasked with gathering sensor data every second. It reads the Modbus data and stores it in a structured JSON format. The data collected every second is averaged every minute, and the resulting data is saved to a file corresponding to that specific minute. This ensures that the system efficiently manages and processes high-frequency sensor data.

## 3. Data Rotation

### `dataRotation.js`

The `dataRotation.js` service handles the periodic deletion of old data files. It ensures that data older than 7 days is deleted every 24 hours. This keeps the storage space manageable and prevents the accumulation of outdated data.

## 4. Data Upload

### `dataUploader.js`

The `dataUploader.js` service is responsible for uploading the collected data to a remote server. This service collects the data from JSON files, organizes it into batches, and sends it to the server. If the data size exceeds a certain limit, it is split into smaller chunks to ensure efficient upload. After a successful upload, the files are moved to an `uploaded` directory, and the local storage is cleared of uploaded data.

## 5. Data Analysis

### `wsReadData.js`

The `wsReadData.js` file provides a service that reads and processes the stored data files to calculate averages over specified intervals. This function is particularly useful for analyzing sensor data over time, such as calculating the average sensor readings over the last 24 hours with a 10-minute interval. If no parameters are provided, it defaults to reading the last 24 hours of data and averaging it in 10-minute intervals. The function filters and groups the data based on the specified time range and returns the calculated averages in a structured format.

## 6. Running the Application

### `index.js`

The `index.js` file is the main entry point for the application. It initiates the database connection and starts all the services, including data collection, rotation, and upload processes. This ensures that the system is up and running as soon as the application starts.

## Conclusion

This guide provides an overview of the file-based data management system. The system is designed to efficiently manage sensor data, rotate old data, and ensure that the data is regularly uploaded to a remote server. Each component is modular, making the system robust and easy to modify based on specific needs.
