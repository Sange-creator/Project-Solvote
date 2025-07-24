const Voter = require('../models/voter.model');
const blockchainService = require('../services/blockchain.service');
const queueService = require('../services/queue.service');
const crypto = require('crypto');
const Candidate = require('../models/candidate.model');

// Verify RFID and get voter details
exports.verifyRFID = async (req, res) => {
  try {
    const { rfidTag } = req.body;
    
    if (!rfidTag) {
      return res.status(400).json({ message: 'RFID tag is required' });
    }

    const voter = await Voter.findOne({ rfidTag });
    
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    if (voter.hasVoted) {
      return res.status(400).json({ message: 'Voter has already cast their vote' });
    }

    return res.status(200).json({
      message: 'RFID verified successfully',
      voterId: voter._id,
      fingerprintHash: voter.fingerprintHash
    });
  } catch (error) {
    console.error('RFID verification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify fingerprint and get encrypted private key
exports.verifyFingerprintAndGetKey = async (req, res) => {
  try {
    const { voterId, fingerprintHash } = req.body;
    
    if (!voterId || !fingerprintHash) {
      return res.status(400).json({ message: 'Voter ID and fingerprint hash are required' });
    }

    const voter = await Voter.findById(voterId);
    
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    if (voter.hasVoted) {
      return res.status(400).json({ message: 'Voter has already cast their vote' });
    }

    // Compare the fingerprint hash
    if (voter.fingerprintHash === fingerprintHash) {
      // Check if wallet details exist
      if (!voter.walletDetails || !voter.walletDetails.encryptedPrivateKey) {
        return res.status(400).json({ message: 'Wallet details not found for this voter' });
      }

      return res.status(200).json({
        message: 'Fingerprint verified successfully',
        walletDetails: {
          publicKey: voter.walletDetails.publicKey,
          encryptedPrivateKey: voter.walletDetails.encryptedPrivateKey,
          iv: voter.walletDetails.iv,
          encryptionKey: voter.walletDetails.encryptionKey,
          encryptionMethod: voter.walletDetails.encryptionMethod
        }
      });
    } else {
      return res.status(401).json({ message: 'Fingerprint verification failed' });
    }
  } catch (error) {
    console.error('Fingerprint verification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark voter as voted
exports.markVoted = async (req, res) => {
  try {
    const { voterId } = req.body;
    
    if (!voterId) {
      return res.status(400).json({ message: 'Voter ID is required' });
    }

    const voter = await Voter.findById(voterId);
    
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    if (voter.hasVoted) {
      return res.status(400).json({ message: 'Voter has already cast their vote' });
    }

    voter.hasVoted = true;
    voter.votedAt = new Date();
    await voter.save();

    return res.status(200).json({ message: 'Vote recorded successfully' });
  } catch (error) {
    console.error('Mark voted error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get wallet details by voter ID
exports.getWalletDetails = async (req, res) => {
  try {
    const voterId = req.params.id;
    
    if (!voterId) {
      return res.status(400).json({ message: 'Voter ID is required' });
    }

    const voter = await Voter.findById(voterId);
    
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    if (!voter.walletDetails || !voter.walletDetails.publicKey) {
      return res.status(404).json({ message: 'Wallet details not found for this voter' });
    }

    return res.status(200).json({
      message: 'Wallet details retrieved successfully',
      walletDetails: {
        publicKey: voter.walletDetails.publicKey,
        encryptedPrivateKey: voter.walletDetails.encryptedPrivateKey,
        iv: voter.walletDetails.iv,
        encryptionKey: voter.walletDetails.encryptionKey,
        encryptionMethod: voter.walletDetails.encryptionMethod
      }
    });
  } catch (error) {
    console.error('Get wallet details error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// New function to handle initial pool transfer
exports.initiateVoting = async (req, res) => {
  try {
    const { voterId } = req.body;
    
    if (!voterId) {
      return res.status(400).json({ message: 'Voter ID is required' });
    }

    const voter = await Voter.findById(voterId);
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    if (voter.hasVoted) {
      return res.status(400).json({ message: 'Voter has already cast their vote' });
    }

    // Generate a voting secret
    const secret = crypto.randomBytes(32).toString('hex');

    // Check and setup pool ATA if needed
    const poolAddress = process.env.VOTING_POOL_ADDRESS;
    const tokenMint = process.env.VOTING_TOKEN_MINT;

    const ataExists = await blockchainService.checkPoolATA(poolAddress, tokenMint);
    if (!ataExists) {
      await blockchainService.createPoolATA(poolAddress, tokenMint);
    }

    // Transfer tokens to pool with secret
    await blockchainService.transferTokensWithSecret(
      process.env.TREASURY_ADDRESS,
      poolAddress,
      1, // 1 token per vote
      secret
    );

    // Store voting data in session
    req.session.votingData = {
      voterId: voterId,
      secret: secret,
      initiated: Date.now()
    };

    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ message: 'Error saving session' });
      }

      res.status(200).json({
        message: 'Voting initiated successfully',
        canProceed: true,
        sessionId: req.sessionID // Send session ID for verification
      });
    });

  } catch (error) {
    console.error('Error initiating voting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// New function to handle vote casting
exports.castVote = async (req, res) => {
  try {
    const { candidateId } = req.body;
    
    // Check if session exists and contains voting data
    if (!req.session.votingData) {
      return res.status(401).json({ message: 'No active voting session found' });
    }

    const { voterId, secret, initiated } = req.session.votingData;

    // Check if session hasn't expired (30 min limit)
    if (Date.now() - initiated > 30 * 60 * 1000) {
      req.session.destroy();
      return res.status(401).json({ message: 'Voting session has expired' });
    }

    // Get voter details
    const voter = await Voter.findById(voterId);
    if (!voter || voter.hasVoted) {
      return res.status(400).json({ message: 'Invalid voter or vote already cast' });
    }

    // Get candidate details
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Validate candidate eligibility
    if (candidate.registrationStatus !== 'completed') {
      return res.status(400).json({ message: 'Selected candidate is not eligible for voting' });
    }

    // Transfer token with blockchain service
    const transferResult = await blockchainService.transferTokensWithSecret(
      voterId,
      candidateId,
      1, // 1 token per vote
      secret
    );

    // Add transfer to queue
    await queueService.addVoteTransfer({
      signature: transferResult.signature,
      voterATA: transferResult.voterATA,
      candidateATA: transferResult.candidateATA,
      amount: 1,
      secret,
      candidateDetails: {
        name: candidate.fullName,
        party: candidate.party,
        position: candidate.position
      }
    });

    // Mark voter as voted
    voter.hasVoted = true;
    voter.votedAt = new Date();
    voter.votedFor = {
      candidateId: candidate._id,
      candidateName: candidate.fullName,
      party: candidate.party,
      position: candidate.position,
      timestamp: new Date()
    };
    await voter.save();

    // Update candidate vote count
    candidate.votes += 1;
    await candidate.save();

    // Clear session after successful vote
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      
      res.status(200).json({
        message: 'Vote cast successfully',
        status: 'pending',
        signature: transferResult.signature,
        candidateDetails: {
          name: candidate.fullName,
          party: candidate.party,
          position: candidate.position,
          currentVotes: candidate.votes
        }
      });
    });

  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add a new endpoint to get candidate details before voting
exports.getCandidateDetails = async (req, res) => {
  try {
    const { candidateId } = req.params;

    // Verify active voting session
    if (!req.session.votingData) {
      return res.status(401).json({ message: 'No active voting session found' });
    }

    const candidate = await Candidate.findById(candidateId)
      .select('fullName party position votes registrationStatus')
      .lean();

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    if (candidate.registrationStatus !== 'completed') {
      return res.status(400).json({ message: 'Candidate is not eligible for voting' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: candidate._id,
        name: candidate.fullName,
        party: candidate.party,
        position: candidate.position,
        currentVotes: candidate.votes
      }
    });

  } catch (error) {
    console.error('Error fetching candidate details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
