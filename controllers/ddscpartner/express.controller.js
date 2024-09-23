const axios = require("axios");
const { PercentCourier } = require("../../model/shippop/percent.model");

module.exports.priceList = async (req, res) => {
	try {
		const percent = await PercentCourier.find();
		// const id = req.decoded.userid;
		const weight = req.body.parcel.weight;

		if (weight === 0) {
			return res.status(400).send({ status: false, message: "กรุณาระบุน้ำหนัก" })
		}

		let data = [];
		data.push({
			"from": {
				"name": req.body.from.name,
				"address": req.body.from.address,
				"district": req.body.from.district,
				"state": req.body.from.state,
				"province": req.body.from.province,
				"postcode": req.body.from.postcode,
				"tel": req.body.from.tel
			},
			"to": {
				"name": req.body.to.name,
				"address": req.body.to.address,
				"district": req.body.to.district,
				"state": req.body.to.state,
				"province": req.body.to.province,
				"postcode": req.body.to.postcode,
				"tel": req.body.to.tel
			},
			"parcel": {
				"name": req.body.parcel.name,
				"weight": weight,
				"width": req.body.parcel.width,
				"length": req.body.parcel.length,
				"height": req.body.parcel.height
			},
			//DHL FLE
			"showall": 1,
		});

		const value = {
			api_key: process.env.SHIPPOP_API_KEY,
			data: data,
		};

		const resp = await axios.post(`${process.env.SHIPPOP_URL}/pricelist/`, value, {
			headers: { "Accept-Encoding": "gzip,deflate,compress" },
		});

		if (!resp.data.status) {
			return res.status(400).send({ status: false, message: resp.data.message });
		}

		const obj = resp.data.data[0];
		const new_data = [];

		for (const ob of Object.keys(obj)) {
			if (obj[ob].available) {
				// ทำการประมวลผลเฉพาะเมื่อ obj[ob].available เป็น true
				let v = null;
				let p = percent.find(element => element.courier_code == obj[ob].courier_code);
				if (!p) {
					console.log(`ยังไม่มี courier name: ${obj[ob].courier_code}`);
				}

				// คำนวนต้นทุนของร้านค้า
				let cost_tg = Number(obj[ob].price);
				let cost = Math.ceil(((cost_tg * p.profit_tg) / 100) + cost_tg);
				let price = Math.ceil(((cost * p.profit_shop) / 100) + cost);
				let profit = cost - cost_tg;
				let profit_shop = price - cost;
				let vat = (profit * 7) / 107;
				let total_platform = Number((profit - vat) * (p.platform / 100));
				v = {
					...obj[ob],
					price_remote_area: 0,
					cost_tg: Number(cost_tg.toFixed()),
					cost: Number(cost.toFixed()),
					profit_tg: Number(profit.toFixed()),
					profit_shop: Number(profit_shop.toFixed()),
					total_platform: Number(total_platform.toFixed()),
					cod_amount: 0,
					fee_cod: 0,
					price: Number(price.toFixed()),
					declared_value: 0,
					insuranceFee: 0,
					total: 0,
					status: null
				};

				let total = 0;
				if (obj[ob].hasOwnProperty("price_remote_area")) { //เช็คว่ามี ราคา พื้นที่ห่างไกลหรือเปล่า
					total += obj[ob].price_remote_area;
					v.price_remote_area = obj[ob].price_remote_area;
				}

				v.total = price + total;

				new_data.push(v);

				return res.status(200).send({ status: true, origin_data: req.body, new: new_data });
			} else {
				// ทำสิ่งที่คุณต้องการทำเมื่อ obj[ob].available เป็น false
				console.log(`Skipping ${obj[ob].courier_code} because available is false`);
			}
		}

	} catch (error) {
		console.log(error)
		return res.status(500).send({ status: false, message: error.message })
	}
};

module.exports.booking = async (req, res) => {
	try {
		const value = {
			api_key: process.env.SHIPPOP_API_KEY,
			email: "tossagundigitalnewgeneration@gmail.com",
			url: {
				"success": "http://shippop.com/?success",
				"fail": "http://shippop.com/?fail"
			},
			data: req.body.product_detail,
			force_confirm: 1
		};
	} catch (error) {
		console.log(error)
		return res.status(500).send({ status: false, message: error.message })
	}
};