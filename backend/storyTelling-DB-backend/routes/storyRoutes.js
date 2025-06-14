const express = require('express');
const router = express.Router();
const { createStory, getStoryWithSections, getStorySectionById , deleteStory, getStoriesByUserId } = require('../controllers/storyController'); // Adjust path as needed

router.post('/stories', createStory);
router.get('/stories/:id', getStoryWithSections);
router.get('/story-section/:id', getStorySectionById);
router.delete('/delete-story/:id', deleteStory);
router.get('/stories/user/:user_id', getStoriesByUserId);


module.exports = router;
