const mongoose = require("mongoose");

const backgroundMusicSchema = mongoose.Schema(
{
    musicmood: {
        type: String,
        required: true
    },
   
    musicCategory: {
        type: String,
        required: true
    },

    subCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BackgroundMusicCategory'
        
    }],

});

module.exports = mongoose.model("BackgroundMusic", backgroundMusicSchema);