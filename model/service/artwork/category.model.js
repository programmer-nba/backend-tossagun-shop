const mongoose = require("mongoose")

const CategoryArtworkSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: false },
});

const CategoryArtworks = mongoose.model("category_artwork", CategoryArtworkSchema);

module.exports = { CategoryArtworks }