const mongoose = require("mongoose")

const CategoryArtworkSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: false },
    emp: { type: String, required: false, default: "ไม่มี" },
});

const CategoryArtworks = mongoose.model("artwork_category", CategoryArtworkSchema);

module.exports = { CategoryArtworks }