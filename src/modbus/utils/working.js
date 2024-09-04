import ModbusRTU from 'modbus-serial';
import logger from '../../common/config/logger.js';
import registers from '../models/modbusRegisters.js';
import modbusQueue from '../services/modbusQueue.js';

class ModbusClient {
  constructor() {
    this.client = new ModbusRTU();
    this.currentData = {}; // Store the latest Modbus data
    this.subscribers = []; // Store subscribers' callback functions
    this.interval = null; // Will hold the setInterval reference
    this.maxRetries = 3; // Maximum number of retries on communication failure
    this.memoryUsage = []; // Array to store memory usage history

    // Log memory usage every hour
    setInterval(() => {
      this.logMemoryUsage();
    }, 60 * 60 * 1000); // Every 1 hour
  }

  // Initialize the Modbus connection and start reading data
  async init() {
    try {
      await this.client.connectRTUBuffered('/dev/ttyS2', {
        baudRate: 19200,
        parity: 'none',
        dataBits: 8,
        stopBits: 1,
      });
      this.client.setID(1);
      this.client.setTimeout(20000);
      logger.info('Modbus client connected successfully to /dev/ttyS2');

      // Start reading data every second
      this.startReading();
    } catch (error) {
      logger.error(`Error initializing Modbus client: ${error.message}`);
      throw error;
    }
  }

  // Start reading Modbus data every second
  startReading(interval = 1000) {
    if (this.interval) {
      logger.warn('ModbusClient is already reading');
      return;
    }

    this.interval = setInterval(() => {
      modbusQueue.addToQueue(() => this.readAndLogData());
    }, interval);

    logger.info('ModbusClient started reading data');
  }

  // Read Modbus data and log memory usage before and after
  async readAndLogData() {
    try {
      let retries = 0;
      let data;

      while (retries < this.maxRetries) {
        try {
          data = await this.readRegisters();
          this.currentData = data;
          logger.info('Modbus data read successfully');
          this.notifySubscribers();
          break;
        } catch (error) {
          retries += 1;
          logger.warn(
            `Modbus read attempt ${retries} failed: ${error.message}`
          );
          if (retries >= this.maxRetries) {
            logger.error('Max retries reached. Skipping this read cycle.');
            return;
          }
        }
      }

      // Record memory usage after each successful read
      this.recordMemoryUsage();
    } catch (error) {
      logger.error(`Error during Modbus read cycle: ${error.message}`);
    }
  }

  // Record memory usage after each Modbus read
  recordMemoryUsage() {
    const memoryInfo = process.memoryUsage();
    this.memoryUsage.push(memoryInfo);
  }

  // Log the accumulated memory usage every hour
  logMemoryUsage() {
    if (this.memoryUsage.length > 0) {
      logger.info(
        'Accumulated Memory Usage Over the Last Hour:',
        this.memoryUsage
      );
      this.memoryUsage = []; // Reset after logging
    } else {
      logger.info('No memory usage data accumulated in the last hour.');
    }
  }

  // Read the Modbus registers based on the model
  async readRegisters() {
    const data = [];
    try {
      for (let reg of registers) {
        const response = await this.client.readHoldingRegisters(reg.address, 1);
        data.push({
          tagName: reg.tagName,
          value: reg.scale(response.data[0]),
        });
      }
    } catch (error) {
      logger.error(`Error reading Modbus registers: ${error.message}`);
      throw error;
    }
    return data;
  }

  // Subscribe to Modbus data updates
  subscribe(callback) {
    if (typeof callback === 'function') {
      this.subscribers.push(callback);
      callback(this.currentData); // Immediately send the latest data to the new subscriber
    } else {
      logger.warn('ModbusClient: Tried to subscribe with a non-function');
    }
  }

  // Notify all subscribers with the latest data
  notifySubscribers() {
    this.subscribers.forEach((callback) => {
      try {
        callback(this.currentData);
      } catch (error) {
        logger.error(`Error notifying subscriber: ${error.message}`);
      }
    });
  }

  // Gracefully close the Modbus client
  async close() {
    if (this.client.isOpen) {
      await this.client.close();
      clearInterval(this.interval);
      this.interval = null;
      logger.info('Modbus client connection closed');
    } else {
      logger.warn('Modbus client was already closed');
    }
  }
}

const modbusClient = new ModbusClient();
export default modbusClient;
