const mongoose = require("mongoose");
const Joi = require("joi");

const ArtworkShema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    detail: {
        type: String,
        enum: ["ราคาต่อตารางเมตร", "ราคาต่อชิ้น", "ราคาต่อชุด"],
        required: true,
    },
    description: { type: String, required: false },
    image: { type: String, required: false },
});

const ProductArtworks = mongoose.model("artwork_product", ArtworkShema);

module.exports = { ProductArtworks };
