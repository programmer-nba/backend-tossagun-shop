const axios = require("axios");
const { Customers } = require("../../../model/user/customer.model");

module.exports.getPrice = async (req, res) => {
	try {
		const id = req.decoded.id;

		const value = {
			api_key: process.env.SHIPPOP_API_KEY,
			data: req.body,
		};

		const resp = await axios.post(`${process.env.SHIPPOP_URL}/pricelist/`, value, {
			headers: { "Accept-Encoding": "gzip,deflate,compress" },
		});

		if (!resp.data.status) {
			return res
				.status(400)
				.send({ status: false, message: resp.data.message });
		}

		const obj = resp.data.data[0];
		const new_data = [];

		// ค้นหาลูกค้า
		const findCustomer = await Customers.findOne({ _id: id });
		if (!findCustomer) {
			return res
				.status(404)
				.send({ status: false, message: "ไม่พบข้อมูลลูกค้าดังกล่าว" })
		}

		for (const ob of Object.keys(obj)) {
			if (obj[ob].available) {
				if (req.body[0].cod_amount > 0 && obj[ob].courier_code == 'ECP') {
					console.log('Encountered "ECP". Skipping this iteration.');
					continue; // ข้ามไปยังรอบถัดไป
				}
				// ทำการประมวลผลเฉพาะเมื่อ obj[ob].available เป็น true
				let v = null;
				let p = percent.find(element => element.courier_code == obj[ob].courier_code);
				// console.log(p)
				if (!p) {
					console.log(`ยังไม่มี courier name: ${obj[ob].courier_code}`);
				}
				// คำนวนต้นทุนของร้านค้า
				let cost_tg = Number(obj[ob].price);
				let cost = Math.ceil(((cost_tg * p.customer) / 100) + cost_tg);
				// let price = Math.ceil(((cost * p.profit_shop) / 100) + cost);
				let profit = cost - cost_tg;
				let vat = (profit * 7) / 107;
				let total_platform = Number((profit - vat) * (p.platform / 100));

				v = {
					...obj[ob],
					price_remote_area: 0,
					cost_tg: Number(cost_tg.toFixed(2)),
					cost: Number(cost.toFixed(2)),
					profit_tg: Number(profit.toFixed(2)),
					total_platform: Number(total_platform.toFixed(2)),
					cod_amount: req.body[0].cod_amount,
					fee_cod: obj[ob].price_cod,
					vat_cod: obj[ob].price_cod_vat,
					price: 0,
					declared_value: 0,
					total: 0,
					status: null
				};

				let total = 0;
				if (obj[ob].hasOwnProperty("price_remote_area")) { //เช็คว่ามี ราคา พื้นที่ห่างไกลหรือเปล่า
					total += obj[ob].price_remote_area
					v.price_remote_area = obj[ob].price_remote_area
				}

				v.total = v.price + total;

				if (findCustomer.shop_wallet < v.total) {
					v.status = "เงินในกระเป๋าของท่านไม่เพียงพอ"
				} else {
					v.status = "พร้อมใช้งาน"
				}

				new_data.push(v);
			} else {
				// ทำสิ่งที่คุณต้องการทำเมื่อ obj[ob].available เป็น false
				// console.log(`Skipping ${obj[ob].courier_code} because available is false`);
			}
		}

		return res.status(200).send({ status: true, origin_data: req.body, new: new_data });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "Internal Server Error" })
	}
};