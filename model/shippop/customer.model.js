const mongoose = require("mongoose");
const Schema = mongoose.Schema

//ผู้ส่งสินค้า
const customerSchema = new Schema({
    status:{type:String, required:false},
    name: {type:String, required: false},
    email: {type:String, default:"", required: false},
    address:{type:String, required: false},
    district:{type:String, required: false,},
    state:{type:String, required: false},
    province:{type:String, required: false},
    postcode:{type:String, required: true},
    tel:{type:String, required: true},
},{timestamps: true});

const customerShippop = mongoose.model("customer_shippop", customerSchema);

module.exports = { customerShippop };
