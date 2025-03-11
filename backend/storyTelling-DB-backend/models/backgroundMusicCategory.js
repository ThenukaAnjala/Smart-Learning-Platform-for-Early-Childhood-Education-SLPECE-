const mongoose = require("mongoose");

const backgroundMusicCategorySchema = mongoose.Schema( 
{
    subCategories: {
        type: String,
        required: true
    },
    musicURL: [{
        type: String,
        required: true
    }]
   
});

module.exports = mongoose.model("BackgroundMusicCategory", backgroundMusicCategorySchema);