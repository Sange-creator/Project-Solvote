const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const MONGODB_URI = "mongodb+srv://solvote:solvote123@solvote.gldnn.mongodb.net/SolVote?retryWrites=true&w=majority&appName=SolVote";
    
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected Successfully');
    
    // Verify connection to specific collection
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 