const express = require("express");
const router = express.Router();
const { createBackgroundMusic } = require("../controllers/musicController");

// POST route to add a new background music category
router.post("/add", createBackgroundMusic);

module.exports = router;
