const mongoose = require("mongoose");
const Joi = require("joi");

const ProductSchema = new mongoose.Schema({
  productTG_brand_id: {type: String, required: false, default: "ไม่มี"},
  productTG_dealer_id: {type: String, required: false, default: "ไม่มี"},
  productTG_name: {type: String, required: true},
  productTG_barcode: {type: String, required: false, default: ""},
  productTG_image: {type: String, required: false, default: ""},
  productTG_category: {type: String, required: false, default: ""},
  productTG_type: {type: Array, required: false, default: []},
  productTG_cost_tg: {type: Number, required: true},
  productTG_cost: {type: Number, required: true},
  productTG_price: {type: Number, required: true},
  productTG_status: {type: Boolean, required: false, default: true},
  productTG_status_type: {type: String, required: false, default: "เครดิต"},
  productTG_detail: {type: String, required: false, default: ""},
  productTG_stock: {type: Number, required: true},
  productTG_store: {type: String, required: false, default: "dealer"},
  productTG_date_start: {type: Date, required: false, default: Date.now()},
  productTG_alcohol_status: {type: Boolean, required: false, default: false},
  productTG_unit_ref: {
    barcode: {type: String, required: false, default: ""},
    amount: {type: Number, required: false, default: 0},
  },
  productTG_emp: {type: String, required: false, default: "ไม่มี"},
});

const ProductTG = mongoose.model("product_tossagun", ProductSchema);

const validate = (data) => {
  const schema = Joi.object({
    productTG_brand_id: Joi.string().default("ไม่มี"),
    productTG_dealer_id: Joi.string().default("ไม่มี"),
    productTG_name: Joi.string().required(),
    productTG_barcode: Joi.string().default(""),
    productTG_image: Joi.string().default(""),
    productTG_category: Joi.string().default(""),
    productTG_type: Joi.array().default([]),
    productTG_cost_tg: Joi.number().required(),
    productTG_cost: Joi.number().required(),
    productTG_price: Joi.number().required(),
    productTG_status: Joi.boolean().default(true),
    productTG_status_type: Joi.string().default("เครดิต"),
    productTG_detail: Joi.string().default(""),
    productTG_stock: Joi.number().required().default(0),
    productTG_store: Joi.string().default("dealer"),
    productTG_date_start: Joi.date().raw().default(Date.now()),
    productTG_alcohol_status: Joi.boolean().default(false),
    productTG_unit_ref: Joi.object({
      barcode: Joi.string().default(""),
      amount: Joi.number().default(0),
    }),
    productTG_emp: Joi.string().default("ไม่มี"),
  });
  return schema.validate(data);
};

module.exports = {ProductTG, validate};
