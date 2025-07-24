const { Connection, PublicKey, Transaction, SystemProgram, Keypair, TransactionInstruction } = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const Voter = require('../models/voter.model');
const Candidate = require('../models/candidate.model');

class BlockchainService {
  constructor() {
    // Initialize Solana connection
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Initialize pool keypair from private key
    const poolPrivateKey = new Uint8Array([
      255, 250, 211,  65, 179, 182, 231, 124, 237, 109, 241,
      84, 171,  64,  72, 113, 236,  46, 197, 161,  97,  34,
      161, 177, 111, 248, 111,  38,  62,  96, 175, 172,  97,
      86, 164, 254,  66, 178, 109, 123, 103, 137,  44,   5,
      39,   0,  68,  72, 241,  40, 170, 214, 206, 150, 228,
      251,  98, 190, 134, 237, 189,  97,  45, 153
    ]);
    this.poolKeypair = Keypair.fromSecretKey(poolPrivateKey);
  }

  async getVoterWalletDetails(voterId) {
    try {
      const voter = await Voter.findById(voterId);
      if (!voter || !voter.walletDetails) {
        throw new Error('Voter wallet details not found');
      }
      return voter.walletDetails;
    } catch (error) {
      console.error('Error fetching voter wallet details:', error);
      throw error;
    }
  }

  async getCandidateWalletDetails(candidateId) {
    try {
      const candidate = await Candidate.findById(candidateId);
      if (!candidate || !candidate.walletDetails) {
        throw new Error('Candidate wallet details not found');
      }
      return candidate.walletDetails;
    } catch (error) {
      console.error('Error fetching candidate wallet details:', error);
      throw error;
    }
  }

  async checkPoolATA(poolAddress, mintAddress) {
    try {
      const poolPublicKey = new PublicKey(poolAddress);
      const mintPublicKey = new PublicKey(mintAddress);
      
      const associatedAddress = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintPublicKey,
        poolPublicKey
      );
      
      const account = await this.connection.getAccountInfo(associatedAddress);
      return {
        exists: !!account,
        address: associatedAddress.toString()
      };
    } catch (error) {
      console.error('Error checking pool ATA:', error);
      throw error;
    }
  }

  async createPoolATA(mintAddress, targetPublicKey) {
    try {
      const mintPubKey = new PublicKey(mintAddress);
      const targetPubKey = new PublicKey(targetPublicKey);

      // Get the ATA address
      const associatedTokenAddress = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintPubKey,
        targetPubKey
      );

      // Create the instruction to create ATA
      const createATAInstruction = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintPubKey,
        associatedTokenAddress,
        targetPubKey,
        this.poolKeypair.publicKey
      );

      // Create and sign transaction
      const transaction = new Transaction().add(createATAInstruction);
      
      // Set recent blockhash and sign transaction
      transaction.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;
      transaction.feePayer = this.poolKeypair.publicKey;
      transaction.sign(this.poolKeypair);

      // Send and confirm transaction
      const signature = await this.connection.sendRawTransaction(transaction.serialize());
      await this.connection.confirmTransaction(signature);

      return {
        ataAddress: associatedTokenAddress.toString(),
        signature
      };
    } catch (error) {
      console.error('Error creating pool ATA:', error);
      throw error;
    }
  }

  async transferTokensWithSecret(voterId, candidateId, amount, secret) {
    try {
      // Get voter and candidate wallet details
      const voterWallet = await this.getVoterWalletDetails(voterId);
      const candidateWallet = await this.getCandidateWalletDetails(candidateId);

      if (!voterWallet.publicKey || !candidateWallet.publicKey) {
        throw new Error('Missing wallet details');
      }

      const voterATA = await this.checkPoolATA(voterWallet.publicKey, process.env.VOTING_TOKEN_MINT);
      const candidateATA = await this.checkPoolATA(candidateWallet.publicKey, process.env.VOTING_TOKEN_MINT);

      // Create ATAs if they don't exist
      if (!voterATA.exists) {
        await this.createPoolATA(process.env.VOTING_TOKEN_MINT, voterWallet.publicKey);
      }
      if (!candidateATA.exists) {
        await this.createPoolATA(process.env.VOTING_TOKEN_MINT, candidateWallet.publicKey);
      }

      // Create transfer instruction
      const transferInstruction = Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        new PublicKey(voterATA.address),
        new PublicKey(candidateATA.address),
        this.poolKeypair.publicKey,
        [],
        amount
      );

      // Create memo instruction with secret
      const memoProgram = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
      const memoInstruction = new TransactionInstruction({
        keys: [],
        programId: memoProgram,
        data: Buffer.from(secret)
      });

      // Create and sign transaction
      const transaction = new Transaction()
        .add(transferInstruction)
        .add(memoInstruction);

      transaction.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;
      transaction.feePayer = this.poolKeypair.publicKey;
      transaction.sign(this.poolKeypair);

      // Send and confirm transaction
      const signature = await this.connection.sendRawTransaction(transaction.serialize());
      await this.connection.confirmTransaction(signature);

      return {
        signature,
        voterATA: voterATA.address,
        candidateATA: candidateATA.address
      };
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw error;
    }
  }
}

module.exports = new BlockchainService(); 