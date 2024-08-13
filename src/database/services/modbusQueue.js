const logger = require('../../logger');

class ModbusQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async addToQueue(task) {
    this.queue.push(task);
    if (!this.processing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const task = this.queue.shift();
    try {
      await task();
    } catch (error) {
      logger.error(`Error processing Modbus queue: ${error.message}`);
    }
    this.processQueue();
  }
}

const modbusQueue = new ModbusQueue();

export default modbusQueue;
