const mongoose = require('mongoose');

// Replace 'your-database-url' with your actual MongoDB URL
const dbUrl = `${process.env.MONGO_URL}/${process.env.MONGO_DB}`;

// Connect to the MongoDB database
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Get the default connection
const db = mongoose.connection;

// Handle connection events
db.on('connected', () => {
  console.log('Connected to MongoDB');
});

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

module.exports = mongoose;
