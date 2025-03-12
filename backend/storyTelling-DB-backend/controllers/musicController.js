const BackgroundMusic = require("../models/backgroundMusic");
const BackgroundMusicCategory = require("../models/backgroundMusicCategory");
const asyncHandler = require('express-async-handler'); 

const createBackgroundMusic = asyncHandler(async (req, res) => {
    const { musicmood, musicCategory, subCategories } = req.body;

    // Validate input
    if (!musicmood || !musicCategory || !subCategories || !Array.isArray(subCategories)) {
        res.status(400);
        throw new Error('All fields are required and subCategories must be an array.');
    }

    // Create an array to store all category references
    const categoryIds = [];
    
    // Create BackgroundMusicCategory documents for each subCategory
    for (const item of subCategories) {
        if (!item.subCategory || !item.musicUrl) {
            res.status(400);
            throw new Error('Each subCategory must have a subCategory and musicUrl');
        }

        // Create a new category for each subCategory
        const newCategory = new BackgroundMusicCategory({
            subCategory: item.subCategory,
            musicURL: [item.musicUrl]  // Put the URL in an array as your schema expects
        });

        const savedCategory = await newCategory.save();
        categoryIds.push(savedCategory._id);
    }

    // Create the main BackgroundMusic entry with all subcategory IDs
    const newMusic = new BackgroundMusic({
        musicmood,
        musicCategory,
        subCategories: categoryIds  // Store all category IDs
    });

    const savedMusic = await newMusic.save();

    // Fetch the complete data to return in the response
    const populatedMusic = await BackgroundMusic.findById(savedMusic._id).populate('subCategories');

    res.status(201).json(populatedMusic);
});

module.exports = {
    createBackgroundMusic,
};