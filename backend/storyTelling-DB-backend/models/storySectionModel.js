const mongoose = require("mongoose");

const StorySectionSchema = mongoose.Schema(
{
    storyText: {
        type: String,
        required: true
    },
    storyImage: {
        type: String,
        required: true
    },

    storyAudio: {
        type: String,
        required: true
    }
    
});

module.exports = mongoose.model("StorySection", StorySectionSchema);
