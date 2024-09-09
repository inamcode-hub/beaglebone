import logger from '../../common/config/logger.js';

class ModbusQueue {
  constructor(queueName, maxQueueSize = 10) {
    this.queue = [];
    this.processing = false;
    this.queueName = queueName; // For logging purposes
    this.maxQueueSize = maxQueueSize;
  }

  async addToQueue(task) {
    if (this.queue.length >= this.maxQueueSize) {
      // Log a warning if the queue size exceeds the max
      logger.warn(
        `[${this.queueName}] Queue is full. Max size of ${this.maxQueueSize} reached. Task will not be added.`
      );
      return; // Don't add the task if the queue is full
    }

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
      // Log an error if the task fails to process
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
