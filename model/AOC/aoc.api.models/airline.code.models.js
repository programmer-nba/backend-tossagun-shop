const mongoose = require("mongoose");
const Joi = require("joi");

const AirlineCodeSchema = new mongoose.Schema({
    airline_code : {type : String, required: false},
    profit_tg : {type : Number, default:0, required : false},
    profit_shop : {type : Number, default:0, required : false},
    on_off: {type : Boolean, default:true, required : false},
})

const AirlineCode = mongoose.model("airline_percent", AirlineCodeSchema);

module.exports = {AirlineCode};