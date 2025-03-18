const mongoose = require("mongoose");

const StorySchema = mongoose.Schema(
{
    user_id: {
        type: String,
        required: true
    },

    storyName: {
        type: String,
        required: true
    },

    story: {
        type: String,
        required: true
    },

    storyTextColor: {
        type: String,
        required: true
    },

    storyTextSize: {
        type: String,
        required: true
    },

    storyTextStyle: {
        type: String,
        required: true
    },

    backgroundMusicURL: {
        type: String,
        required: true
    },

    storySection: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StorySection'
    }]
});

module.exports = mongoose.model("Story", StorySchema);