require('dotenv').config();
const mongoose = require('mongoose');
const Candidate = require('../models/candidate.model');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing candidates
    await Candidate.deleteMany({});
    console.log('Cleared existing candidates');

    const testCandidates = [
      {
        fullName: "John Smith",
        party: "Progressive Party",
        position: "President",
        votes: 0,
        registrationStatus: "completed"
      },
      {
        fullName: "Sarah Johnson",
        party: "Democratic Alliance",
        position: "President",
        votes: 0,
        registrationStatus: "completed"
      }
    ];

    const result = await Candidate.insertMany(testCandidates);
    console.log('Test data inserted:', result);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 