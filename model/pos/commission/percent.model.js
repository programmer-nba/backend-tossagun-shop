const mongoose = require("mongoose");
const Joi = require("joi");

const PercentSchema = new mongoose.Schema({
  percent: {
    central: {type: Number, required: true},
    platform: {type: Number, required: true},
    terrestrial: {type: Number, required: true},
  },
  percent_central: {
    central: {type: Number, required: true},
    allsale: {type: Number, required: true},
  },
  percent_platform: {
    level_one: {type: Number, required: true},
    level_two: {type: Number, required: true},
    level_tree: {type: Number, required: true},
    level_owner: {type: Number, required: true},
  },
  percent_terrestrial: {
    bonus: {type: Number, required: true},
  },
  code: {type: String, required: true},
  employee: {type: String, required: false, default: "ไม่มี"},
});

const Percents = mongoose.model("percent_profit", PercentSchema);

const validate = (data) => {
  const schema = Joi.object({
    percent: Joi.object({
      central: Joi.number().required(),
      platform: Joi.number().required(),
      terrestrial: Joi.number().required(),
    }),

    percent_central: Joi.object({
      central: Joi.number().required(),
      allsale: Joi.number().required(),
    }),
    percent_platform: Joi.object({
      level_one: Joi.number().required(),
      level_two: Joi.number().required(),
      level_tree: Joi.number().required(),
      level_owner: Joi.number().required(),
    }),
    percent_terrestrial: Joi.object({
      bonus: Joi.number().required(),
    }),
    code: Joi.string().required(),
    employee: Joi.string().default("ไม่มี"),
  });
  return schema.validate(data);
};

module.exports = {Percents, validate};
