import EventEmitter from 'events';
import ModbusRTU from 'modbus-serial';
import logger from '../../common/config/logger.js';
import registers from '../models/modbusRegisters.js';
import { modbusReadQueue, modbusWriteQueue } from './modbusQueue.js';

class ModbusClient extends EventEmitter {
  constructor() {
    super();
    this.client = new ModbusRTU();
    this.currentData = {}; // Store the latest Modbus data
    this.interval = null; // Will hold the setInterval reference for reading
    this.maxRetries = 3; // Maximum number of retries on communication failure
    this.firstDataReceived = false;
    this.isReadingPaused = false; // Flag to pause reading during write
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

      // Start reading data every 1 second
      this.startReading(1000); // 1-second interval
    } catch (error) {
      logger.error(`Error initializing Modbus client: ${error.message}`);
      throw error;
    }
  }

  // Start reading Modbus data every X seconds
  startReading(interval = 1000) {
    if (this.interval) {
      logger.warn('ModbusClient is already reading');
      return;
    }

    this.interval = setInterval(() => {
      if (!this.isReadingPaused && modbusWriteQueue.queue.length === 0) {
        // Prioritize writes over reads
        modbusReadQueue.addToQueue(() => this.readAndLogData());
      }
    }, interval);

    logger.info(
      `ModbusClient started reading data every ${interval / 1000} seconds`
    );
  }

  // Stop reading temporarily (used for write operations)
  stopReading() {
    logger.info('Stopping reading for write operation...');
    this.isReadingPaused = true;
  }

  // Resume reading after a delay (used post-write)
  resumeReading(delay = 1000) {
    logger.info(`Resuming reading after ${delay} ms...`);
    setTimeout(() => {
      this.isReadingPaused = false;
    }, delay);
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

  // Read Modbus registers in blocks
  async readRegisters() {
    const data = [];
    const blocks = this.createBlocks(registers); // Create blocks of registers to read

    try {
      for (const block of blocks) {
        const response = await this.client.readHoldingRegisters(
          block.start,
          block.count
        );
        for (let i = 0; i < block.count; i++) {
          const reg = registers.find((r) => r.address === block.start + i);
          if (reg) {
            const rawValue = response.data[i];
            const scaledValue = reg.scale(rawValue);
            data.push({
              tagName: reg.tagName,
              value: scaledValue,
            });
            // Update currentData directly
            this.currentData[reg.tagName] = scaledValue;
          }
        }
      }
    } catch (error) {
      logger.error(
        `Error reading Modbus registers in blocks: ${error.message}`
      );
      throw error;
    }

    return data;
  }

  // Helper function to create blocks of consecutive registers for more efficient reading
  createBlocks(registers) {
    const blocks = [];
    let currentBlock = { start: null, count: 0 };

    registers.forEach((reg, index) => {
      if (currentBlock.start === null) {
        currentBlock.start = reg.address;
        currentBlock.count = 1;
      } else if (registers[index - 1].address + 1 === reg.address) {
        currentBlock.count += 1;
      } else {
        blocks.push({ ...currentBlock });
        currentBlock = { start: reg.address, count: 1 };
      }
    });

    if (currentBlock.start !== null) blocks.push(currentBlock);
    return blocks;
  }

  // Write to a Modbus register, using the write queue and pausing reads during the write
  async writeRegister(registerAddress, value) {
    return modbusWriteQueue.addToQueue(async () => {
      try {
        this.stopReading();
        logger.info('Paused reading for 5 seconds...');
        await this.delay(5000); // Delay 5 seconds before write

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

        this.resumeReading(1000); // Resume reading after 1 second
        return result;
      } catch (error) {
        logger.error(`Error writing to register: ${error.message}`);
        throw error;
      }
    });
  }

  // Helper function to add delay
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
