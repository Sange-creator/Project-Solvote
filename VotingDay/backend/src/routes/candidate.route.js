const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidate.controller');

// Get all candidates
router.get('/', candidateController.getCandidates);

// Get a single candidate by ID
router.get('/:id', candidateController.getCandidateById);

// Update vote count
router.put('/:id/vote', candidateController.updateVoteCount);

module.exports = router; 