const BackgroundMusic = require("../models/backgroundMusic");
const BackgroundMusicCategory = require("../models/backgroundMusicCategory");
const asyncHandler = require('express-async-handler'); 

/**
 * Controller to get music URLs by specific parameters
 * @route GET /story-music/urls
 * @param {string} musicmood - The mood of the music
 * @param {string} musicCategory - The category of the music
 * @param {string} subCategory - The subcategory of the music
 * @returns {Object} - Object containing the parameters and matching URLs
 */


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
        if (!item.subCategory || !item.musicUrl || !Array.isArray(item.musicUrl)) {
            res.status(400);
            throw new Error('Each subCategory must have a subCategory and musicUrl array');
        }

        // Create a new category for each subCategory
        const newCategory = new BackgroundMusicCategory({
            subCategory: item.subCategory,
            musicURL: item.musicUrl  // This should already be an array
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


const getMusicURLsByParams = asyncHandler(async (req, res) => {
    // Get parameters from query string
    const { musicmood, musicCategory, subCategory } = req.query;
    
    // Validate required parameters
    if (!musicmood || !musicCategory || !subCategory) {
        return res.status(400).json({ 
            message: 'Missing required parameters. Please provide musicmood, musicCategory, and subCategory.' 
        });
    }
    
    try {
        // Find music entries that match mood and category
        const music = await BackgroundMusic.find({
            musicmood: musicmood,
            musicCategory: musicCategory
        }).populate('subCategories');
        
        if (!music || music.length === 0) {
            return res.status(404).json({ 
                message: `No music found for mood: ${musicmood}, category: ${musicCategory}` 
            });
        }
        
        // Extract URLs from matching subcategories
        let urls = [];
        
        for (const item of music) {
            const matchingSubCategories = item.subCategories.filter(
                sc => sc.subCategory === subCategory
            );
            
            if (matchingSubCategories.length > 0) {
                // Add URLs from this matching subcategory to our results
                const subCategoryUrls = matchingSubCategories.flatMap(sc => sc.musicURL);
                urls = [...urls, ...subCategoryUrls];
            }
        }
        
        if (urls.length === 0) {
            return res.status(404).json({ 
                message: `No music found for mood: ${musicmood}, category: ${musicCategory}, subcategory: ${subCategory}` 
            });
        }
        
        // Return the parameters and matching URLs
        return res.json({
            musicmood,
            musicCategory,
            subCategory,
            urls
        });
    } catch (error) {
        console.error('Error in getMusicURLsByParams:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


module.exports = {
    createBackgroundMusic, getMusicURLsByParams
};