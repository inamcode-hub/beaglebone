import EventEmitter from 'events';
import ModbusRTU from 'modbus-serial';
import logger from '../../common/config/logger.js';
import registers from '../models/modbusRegisters.js';
import { modbusReadQueue, modbusWriteQueue } from '../services/modbusQueue.js';

class ModbusClient extends EventEmitter {
  constructor() {
    super(); // Call the EventEmitter constructor
    this.client = new ModbusRTU();
    this.currentData = {}; // Store the latest Modbus data
    this.subscribers = []; // Store subscribers' callback functions
    this.interval = null; // Will hold the setInterval reference
    this.maxRetries = 3; // Maximum number of retries on communication failure
    this.firstDataReceived = false;
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

      // Start reading data every 5 seconds
      this.startReading(5000); // 5-second interval
    } catch (error) {
      logger.error(`Error initializing Modbus client: ${error.message}`);
      throw error;
    }
  }

  // Start reading Modbus data every X seconds
  startReading(interval = 5000) {
    if (this.interval) {
      logger.warn('ModbusClient is already reading');
      return;
    }

    this.interval = setInterval(() => {
      // Add reading task to the read queue
      modbusReadQueue.addToQueue(() => this.readAndLogData());
    }, interval);

    logger.info(
      `ModbusClient started reading data every ${interval / 1000} seconds`
    );
  }

  // Read Modbus data and log results
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

          if (!this.firstDataReceived) {
            this.firstDataReceived = true;
            this.emit('dataReady', this.currentData); // Emit the event when first data is received
          }

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
    } catch (error) {
      logger.error(`Error during Modbus read cycle: ${error.message}`);
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

  // Write to a Modbus register, using the write queue and detailed logging
  async writeRegister(registerAddress, value) {
    return modbusWriteQueue.addToQueue(async () => {
      try {
        if (!this.client.isOpen) {
          logger.warn('Modbus client not open. Reconnecting...');
          await this.client.connectRTUBuffered('/dev/ttyS2', {
            baudRate: 19200,
            parity: 'none',
            dataBits: 8,
            stopBits: 1,
          });
          this.client.setID(1);
        }

        logger.info(
          `Attempting to write value ${value} to register ${registerAddress}`
        );

        const result = await this.client.writeRegister(registerAddress, value);

        if (result) {
          logger.info(
            `Successfully wrote value ${value} to register ${registerAddress}`
          );
        } else {
          logger.warn('Modbus write operation returned undefined result');
        }

        return result;
      } catch (error) {
        logger.error(`Error writing to register: ${error.message}`);
        throw error;
      }
    });
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
