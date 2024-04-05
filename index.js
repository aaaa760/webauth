const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();
mongoose.connect(process.env.MONGODB_URI).then(() => console.log("Connected to Mongo DB Atlas")).catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

app.use(express.json());
const authRouter = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');

// Use the authRouter for authentication routes
app.use(authRouter);

// Use the authMiddleware for protecting routes
app.use(authMiddleware);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});