const mongoose = require("mongoose");
const Joi = require("joi");

const ProductSchema = new mongoose.Schema({
  product_brand_id: {type: String, required: false, default: "ไม่มี"},
  product_dealer_id: {type: String, required: false, default: "ไม่มี"},
  product_shop_id: {type: String, required: false, default: "ไม่มี"},
  product_type: {type: Array, required: false, default: []},
  product_name: {type: String, required: true}, //
  product_barcode: {type: String, required: false, default: ""},
  product_image: {type: String, required: false, default: ""}, //
  product_cost: {type: Number, required: true},
  product_cost_shop: {type: Number, required: true},
  product_price: {type: Number, required: true},
  product_status: {type: Boolean, required: false, default: true},
  product_status_type: {type: String, required: false, default: "เครดิต"},
  product_detail: {type: String, required: false, default: ""},
  product_stock: {type: Number, required: true}, //
  product_store: {type: String, required: false, default: "dealer"}, //
  product_date_start: {type: Date, required: false, default: Date.now()}, // เริ่ม
  product_vat_status: {type: Boolean, required: false, default: true}, // เพิ่ม
  product_pack_status: {type: Boolean, required: false, default: false}, // false คือ ไม่มีการขายแบบลัง true คือ มีการขายย่อยและลัง
  product_unit_ref: {
    barcode: {type: String, required: false, default: ""},
    amount: {type: Number, required: false, default: 0},
  },
  product_alcohol_status: {type: Boolean, required: false, default: false},
  product_category: {type: String, required: false, default: ""},
  product_more: {
    difference: {type: Number, required: false, default: 0},
    vat_sell: {type: Number, required: false, default: 0},
    vat_buy: {type: Number, required: false, default: 0},
  },
});

const ProductsTossaguns = mongoose.model("product_tossagun", ProductSchema);

const validate = (data) => {
  const schema = Joi.object({
    product_brand_id: Joi.string().default("ไม่มี"),
    product_dealer_id: Joi.string().default("ไม่มี"),
    product_shop_id: Joi.string().default("ไม่มี"),
    product_type: Joi.array().default([]),
    product_name: Joi.string().required(),
    product_barcode: Joi.string().default(""),
    product_image: Joi.string().default(""),
    product_cost: Joi.number().required(),
    product_cost_shop: Joi.number().required(),
    product_price: Joi.number().required(),
    product_status: Joi.boolean().default(true),
    product_status_type: Joi.string().default("เครดิต"),
    product_detail: Joi.string().default(""),
    product_stock: Joi.number().required(), // default 0
    product_store: Joi.string().default("dealer"),
    product_date_start: Joi.date().raw().default(Date.now()),
    product_vat_status: Joi.boolean().default(true),
    product_pack_status: Joi.boolean().default(false),
    product_unit_ref: Joi.object({
      barcode: Joi.string().default(""),
      amount: Joi.number().default(0),
    }),
    product_alcohol_status: Joi.boolean().default(false),
    product_category: Joi.string().default(""),
    product_more: {
      difference: Joi.number().default(0),
      vat_sell: Joi.number().default(0),
      vat_buy: Joi.number().default(0),
    },
  });
  return schema.validate(data);
};

module.exports = {ProductsTossaguns, validate};
