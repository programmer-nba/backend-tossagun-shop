const { PriceCourier } = require("../../model/express.model/percent.courier.model");
const { OrderExpress } = require("../../model/express.model/order.express.model");
const { Shops } = require("../../model/pos/shop.model");
const { BookingParcel } = require("../../model/express.model/booking.parcel.model");
const { AddressSender } = require("../../model/express.model/address.sender.model");
const { AddressRecipient } = require("../../model/express.model/address.recipient.model");
const axios = require("axios");

exports.pricelist = async (req, res) => {
    try {
        const percent = await PriceCourier.find();
        let data = [];
        data.push(req.body);
        const value = {
            api_key: process.env.SHIPPOP_API_KEY,
            data: data,
        };
        const resp = await axios.post(`${process.env.SHIPPOP_URL}/pricelist/`, value,
            {
                headers: { "Accept-Encoding": "gzip,deflate,compress" },
            }
        )
        if (!resp.data.status) {
            return res.status(400).send({ status: false, message: resp.data.message });
        }
        const obj = resp.data.data[0];
        const new_data = [];
        Object.keys(obj).forEach(async (ob) => {
            let v = null;
            let p = percent.find((c) => c.courier_code === obj[ob].courier_code);
            if (!p) {
                p = percent.find((c) => c.courier_code === "OTHER");
                if (!p) {
                    p = {
                        courier_code: "NONE",
                        percent_tg: 10,
                        percent_shop: 10,
                    };
                }
            }
            // คำนวนต้นทุนของร้านค้า
            let cost_tg = Number(obj[ob].price);
            let cost = cost_tg + p.percent_tg; // ต้นทุน nba + ((ต้นทุน nba * เปอร์เซ็น nba)/100)
            let price = cost + p.percent_shop;
            v = {
                ...obj[ob],
                cost_tg: cost_tg,
                cost: cost,
                price: Number(price.toFixed()),
            };
            new_data.push(v);
        });
        return res.status(200).send({ status: true, origin_data: req.body, data: new_data });
    } catch (error) {
        console.log(err);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด" });
    }
};

exports.booking = async (req, res) => {
    try {
        // console.log("data body : ", req.body);
        const price = await PriceCourier.find();
        let data = [];
        for (let item of req.body) {
            console.log(item)
            data.push(item.detail.parcel);
        }
        console.log(data);
    } catch (error) {
        console.log(err);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด" });
    }
}