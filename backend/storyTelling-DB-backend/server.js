require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const errorHandler = require("./middlewares/errormiddleware");
const connectDB = require("./config/connectDb");

connectDB();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(errorHandler);
app.use('/story-liabrary',require('./routes/storyRoutes'))
app.use('/story-music',require('./routes/musicRoutes'))

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