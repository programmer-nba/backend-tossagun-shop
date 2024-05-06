const mongoose = require("mongoose");
const Joi = require("joi");

const flightTicketSchema = new mongoose.Schema({
  maker_id: { type: String, required: false, default: "" },
  shop_id: { type: String, required: false, default: "" },
  platform: { type: String, required: true },
  invoice: { type: String, required: false, default: "ไม่มี" },
  total_cost: { type: Number, required: false, default: 0 },
  total_commission: { type: Number, required: true },
  total: { type: Number, required: true },
  transaction_id: { type: String, required: true },
  contactInfo: { type: Object, default: {} },
  shop_type: {
    type: String,
    enum: ["One Stop Shop", "One Stop Service", "One Stop Platform"],
    required: true,
  },
  employee: { type: String, required: false, default: "ไม่มี" },
  status: { type: Array, required: false, default: [] },
  timestamp: { type: Date, required: false, default: Date.now() },
});

const OrderFlightTicket = mongoose.model("order_ticket", flightTicketSchema);

const valiTicket = (data) => {
  const schema = Joi.object({
    maker_id: Joi.string().default(""),
    shop_id: Joi.string().default(""),
    platform: Joi.string().required().label("ไม่พบรหัส Platform"),
    invoice: Joi.string(),
    total: Joi.number().required().label("ไม่พบยอดรวมในใบเสร็จ"),
    total_commission: Joi.number().required().label("ไม่พบค่าคอมมิชชั่น"),
    total_cost: Joi.number.default(0),
    transaction_id: Joi.string(),
    booking: Joi.array(),
    employee: Joi.string().label("ไม่มี"),
    timestamp: Joi.date().default(Date.now()),
  });
  return schema.valiTicket(data);
};

module.exports = { OrderFlightTicket, valiTicket };
