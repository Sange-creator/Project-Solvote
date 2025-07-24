const Candidate = require('../models/candidate.model');
const mongoose = require('mongoose');

// Get all candidates
const getCandidates = async (req, res) => {
  try {
    console.log('GET /candidates request received');
    
    const candidates = await Candidate.find({})
      .select('fullName party position votes registrationStatus')
      .sort({ fullName: 1 })
      .lean();

    console.log('Found candidates:', candidates);

    if (!candidates || candidates.length === 0) {
      console.log('No candidates found');
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const formattedCandidates = candidates.map(candidate => ({
      _id: candidate._id.toString(),
      fullName: candidate.fullName || '',
      party: candidate.party || '',
      position: candidate.position || '',
      votes: candidate.votes || 0,
      registrationStatus: candidate.registrationStatus || 'pending'
    }));

    console.log('Sending formatted candidates:', formattedCandidates);

    res.status(200).json({
      success: true,
      data: formattedCandidates
    });
  } catch (error) {
    console.error('Error in getCandidates:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching candidates',
      error: error.message 
    });
  }
};

// Get a single candidate by ID
const getCandidateById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid candidate ID format'
      });
    }

    const candidate = await Candidate.findById(req.params.id)
      .select('fullName party position votes registrationStatus')
      .lean();

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching candidate',
      error: error.message
    });
  }
};

// Update vote count for a candidate
const updateVoteCount = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid candidate ID format'
      });
    }

    const candidate = await Candidate.findOneAndUpdate(
      { 
        _id: req.params.id,
        registrationStatus: 'completed' // Only allow voting for completed registrations
      },
      { $inc: { votes: 1 } },
      { 
        new: true,
        runValidators: true,
        select: 'fullName party position votes'
      }
    ).lean();
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found or not eligible for voting'
      });
    }

    res.status(200).json({
      success: true,
      data: candidate,
      message: 'Vote count updated successfully'
    });
  } catch (error) {
    console.error('Error updating vote count:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vote count',
      error: error.message
    });
  }
};

module.exports = {
  getCandidates,
  getCandidateById,
  updateVoteCount
}; 