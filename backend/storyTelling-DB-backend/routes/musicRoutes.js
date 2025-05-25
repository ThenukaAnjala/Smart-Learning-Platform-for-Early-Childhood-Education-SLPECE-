const express = require('express');
const router = express.Router();
const { 
    createBackgroundMusic, 
    getMusicURLsByParams 
} = require('../controllers/musicController');

// Create new background music
router.post('/', createBackgroundMusic);

// Get music by parameters in request body
router.get('/search', getMusicURLsByParams);


module.exports = router;