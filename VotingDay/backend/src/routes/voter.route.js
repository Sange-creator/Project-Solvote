const express = require('express');
const router = express.Router();
const voterController = require('../controllers/voter.controller');
const sessionCheck = require('../middleware/sessionCheck');

// Public routes
router.post('/verify-rfid', voterController.verifyRFID);
router.post('/verify-fingerprint', voterController.verifyFingerprintAndGetKey);

// Protected routes that require session
router.post('/initiate-voting', voterController.initiateVoting);
router.post('/cast-vote', sessionCheck, voterController.castVote);
router.post('/mark-voted', sessionCheck, voterController.markVoted);
router.get('/wallet-details/:id', sessionCheck, voterController.getWalletDetails);

// Get candidate details before voting
router.get('/candidate-details/:candidateId', sessionCheck, voterController.getCandidateDetails);

module.exports = router;
