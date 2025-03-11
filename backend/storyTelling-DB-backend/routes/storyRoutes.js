const express = require('express');
const router = express.Router();
const { createStory, getStoryWithSections, getStorySectionById , deleteStory } = require('../controllers/storyController'); // Adjust path as needed

router.post('/stories', createStory);
router.get('/stories/:id', getStoryWithSections);
router.get('/story-section/:id', getStorySectionById);
router.delete('/delete-story/:id', deleteStory);

module.exports = router;
