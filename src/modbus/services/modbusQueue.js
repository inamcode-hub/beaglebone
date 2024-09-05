import logger from '../../common/config/logger.js';

class ModbusQueue {
  constructor(queueName) {
    this.queue = [];
    this.processing = false;
    this.queueName = queueName; // For debugging and logging purposes
  }

  async addToQueue(task) {
    this.queue.push(task);
    logger.debug(
      `[${this.queueName}] Added task to queue. Queue length: ${this.queue.length}`
    );

    if (!this.processing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      logger.debug(`[${this.queueName}] Queue is empty, stopping processing.`);
      return;
    }

    this.processing = true;
    const task = this.queue.shift();
    try {
      const startTime = Date.now();
      logger.debug(`[${this.queueName}] Processing task from queue...`);
      await task();
      const endTime = Date.now();
      logger.debug(
        `[${this.queueName}] Task completed in ${endTime - startTime}ms`
      );
    } catch (error) {
      logger.error(
        `[${this.queueName}] Error processing task: ${error.message}`
      );
    }

    this.processing = false;

    // Continue processing if more tasks exist in the queue
    if (this.queue.length > 0) {
      this.processQueue();
    }
  }
}

const modbusReadQueue = new ModbusQueue('Modbus Read Queue');
const modbusWriteQueue = new ModbusQueue('Modbus Write Queue');

export { modbusReadQueue, modbusWriteQueue };
