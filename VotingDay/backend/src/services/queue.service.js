const Bull = require('bull');
const blockchainService = require('./blockchain.service');

class QueueService {
  constructor() {
    this.voteQueue = new Bull('vote-transfers', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      }
    });

    this.setupQueueProcessor();
  }

  setupQueueProcessor() {
    this.voteQueue.process(async (job) => {
      const { fromAddress, toAddress, amount, secret } = job.data;
      
      try {
        await blockchainService.transferTokensWithSecret(
          fromAddress,
          toAddress,
          amount,
          secret
        );
        return { success: true };
      } catch (error) {
        console.error('Error processing vote transfer:', error);
        throw error;
      }
    });
  }

  async addVoteTransfer(transferData) {
    const delay = Math.floor(Math.random() * (300000 - 60000) + 60000); // Random delay between 1-5 minutes
    return this.voteQueue.add(transferData, { delay });
  }
}

module.exports = new QueueService(); 