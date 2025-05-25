const asyncHandler = require('express-async-handler');
const Story = require('../models/storyModel'); // Adjust the path as needed
const StorySection = require('../models/storySectionModel');

// Create a new story
const createStory = asyncHandler(async (req, res) => {
    const { user_id, storyName, story, storyTextColor, storyTextSize, storyTextStyle, backgroundMusicURL, storySections } = req.body;

    // Validate input
    if (!user_id || !storyName || !story || !storyTextColor || !storyTextSize || !storyTextStyle || !backgroundMusicURL || !storySections) {
        res.status(400);
        throw new Error("All fields are required.");
    }

    // Ensure storySections is an array
    if (!Array.isArray(storySections) || storySections.length === 0) {
        res.status(400);
        throw new Error("storySections must be a non-empty array.");
    }

    // Save StorySections sequentially to maintain order
    const sectionIds = [];
    for (const section of storySections) {
        const newSection = new StorySection(section);
        const savedSection = await newSection.save();
        sectionIds.push(savedSection._id);
    }

    // Create the Story
    const newStory = new Story({
        user_id,
        storyName,
        story,
        storyTextColor,
        storyTextSize,
        storyTextStyle,
        backgroundMusicURL,
        storySection: sectionIds, // Sections are now stored in correct order
    });

    const savedStory = await newStory.save();

    res.status(201).json({
        message: "Story created successfully.",
        story: savedStory
    });
});


// Get a story with populated sections
const getStoryWithSections = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the story and populate storySection
        const story = await Story.findById(id).populate('storySection');

        if (!story) {
            res.status(404);
            throw new Error("Story not found.");
        }

        res.status(200).json(story);
    } catch (error) {
        console.error("Error fetching story with sections:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

const getStorySectionById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Fetch the StorySection by ID
    const storySection = await StorySection.findById(id);

    if (!storySection) {
        res.status(404);
        throw new Error("StorySection not found.");
    }

    res.status(200).json(storySection);
});

const deleteStory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find the story by ID
    const story = await Story.findById(id);

    if (!story) {
        res.status(404);
        throw new Error("Story not found.");
    }

    // Delete all associated StorySections
    await StorySection.deleteMany({ _id: { $in: story.storySection } });

    // Delete the story
    await Story.findByIdAndDelete(id);

    res.status(200).json({
        message: "Story and its associated sections deleted successfully.",
        storyId: id
    });
});

const getStoriesByUserId = asyncHandler(async (req, res) => {
    const { user_id } = req.params;

    // Fetch stories by user_id
    const stories = await Story.find({ user_id }, 'storyName _id');

    if (!stories || stories.length === 0) {
        res.status(404);
        throw new Error("No stories found for this user.");
    }

    res.status(200).json(stories);
});


module.exports = {
    createStory,
    getStoryWithSections,
    getStorySectionById,
    deleteStory,
    getStoriesByUserId
};
