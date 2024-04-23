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
    rating: { type: Number, require: false, default: 0 },
    description: { type: String, required: false },
    image: { type: String, required: false, default: "" },
    emp: { type: String, required: false, default: "" },
});

const ProductArtworks = mongoose.model("artwork_product", ArtworkShema);

const validate = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().label("กรุณากรอกชื่อแพ็คเก็จ"),
        category: Joi.string().required().label("กรุณากรอกไอดีประเภท"),
        detail: Joi.string().required().label("กรุณากรอกประเภท"),
        description: Joi.string().default(""),
    });
    return schema.validate(data);
}

module.exports = { ProductArtworks, validate };
