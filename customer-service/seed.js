const mongoose = require('mongoose');
const User = require('./models/User');
const config = require('./config');

// Connect to MongoDB
mongoose.connect(config.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding...'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });

// Sample data
const users = [
  {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
  }
];

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    console.log('Data cleared');

    // Create users
    await User.create(users);
    console.log('Sample users created');

    mongoose.connection.close();
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedData();