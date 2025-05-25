require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const errorHandler = require("./middlewares/errormiddleware");
const connectDB = require("./config/connectDb");
const AWS = require('aws-sdk');
const s3Routes = require('./routes/awsRoutes');

connectDB();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(errorHandler);
app.use('/story-liabrary',require('./routes/storyRoutes'))
app.use('/story-music',require('./routes/musicRoutes'))
app.use('/s3', s3Routes); 

app.get('/test-aws', async (req, res) => {
  try {
    const data = await s3.listBuckets().promise();
    res.json({ buckets: data.Buckets });
  } catch (error) {
    res.status(500).json({ error: 'AWS connection failed', details: error.message });
  }
});

let serverPromise = new Promise((resolve, reject) => {
  mongoose.connection.once("open", () => {
    console.log(`🚀 data connection with code engine established! 🚀`);
    const server = app.listen(PORT, () => {
      console.log(
        `👦 Code management service is up and running on port: ${PORT} 👦`
      );
      resolve(server);
    });
  });
});

module.exports = { app, serverPromise };