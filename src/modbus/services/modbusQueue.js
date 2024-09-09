import logger from '../../common/config/logger.js';

class ModbusQueue {
  constructor(queueName, maxQueueSize = 10) {
    // Added maxQueueSize parameter
    this.queue = [];
    this.processing = false;
    this.queueName = queueName; // For debugging and logging purposes
    this.maxQueueSize = maxQueueSize;
  }

  async addToQueue(task) {
    if (this.queue.length >= this.maxQueueSize) {
      // Check queue size before adding
      logger.warn(
        `[${this.queueName}] Queue is full. Max size of ${this.maxQueueSize} reached. Task will not be added.`
      );
      return; // Don't add the task if the queue is full
    }

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

const modbusReadQueue = new ModbusQueue('Modbus Read Queue', 10); // Set max queue size for reads
const modbusWriteQueue = new ModbusQueue('Modbus Write Queue', 5); // Set max queue size for writes

export { modbusReadQueue, modbusWriteQueue };
