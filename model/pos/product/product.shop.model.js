const mongoose = require("mongoose");
const Joi = require("joi");

const ProductShopSchema = new mongoose.Schema({
  productShop_id: { type: String, required: true },
  productShop_barcode: { type: String, required: false, default: "" },
  productShop_status: { type: Boolean, required: false, default: true },
  productShop_stock: { type: Number, required: false, default: 0 },
  productShop_type: { type: Boolean, required: false, default: false },
  productShop_pack_name: {
    type: String,
    enum: ["ลัง", "แพ็ค", "โหล", "ซอง", "ชิ้น"],
    required: false,
    default: 'ชิ้น',
  },
  productShop_unit_ref: {
    barcode: { type: String, required: false, default: "" },
    amount: { type: Number, required: false, default: 0 },
  },
  productShop_ref: { type: String, required: false, default: "" },
  productShop_tossagun_id: { type: String, required: false, default: "ไม่มี" },
  productShop_vat_status: { type: Boolean, required: false, default: true },
  productShop_emp: { type: String, required: false, default: "ไม่มี" },
  // --------------------------------
});

const ProductShops = mongoose.model("product_shop", ProductShopSchema);

const validate = (data) => {
  const schema = Joi.object({
    productShop_id: Joi.string().required(),
    productShop_barcode: Joi.string().default(""),
    productShop_status: Joi.boolean().default(true),
    productShop_stock: Joi.number().default(0),
    productShop_type: Joi.boolean().default(false),
    product_pack_name: Joi.string().default("ชิ้น"),
    product_pack_amount: Joi.string().default(0),
    productShop_tossagun_id: Joi.string().default("ไม่มี"),
    productShop_unit_ref: Joi.object({
      barcode: Joi.string().default(""),
      amount: Joi.number().default(0),
    }),
    productShop_ref: Joi.string().default(""),
    productShop_vat_status: Joi.boolean().default(true), // เพิม
    productShop_emp: Joi.string().default("ไม่มี"),
  });
  return schema.validate(data);
};

module.exports = { ProductShops, validate };
