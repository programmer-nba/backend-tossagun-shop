const axios = require("axios");
const { Customers } = require("../../../model/user/customer.model");

module.exports.getPrice = async (req, res) => {
	try {
		const id = req.decoded.id;
		const weight = req.body.parcel.weight
		const declared_value = req.body.declared_value
		const formData = req.body
		const cod_amount = req.body.cod_amount
		const shop = req.body.shop_number

		let data = [];
		data.push({
			...req.body,
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
				console.log(obj[ob])
				let v = null;
				let p = findCustomer.cus_function.find((el) => el.name === 'express');
				console.log(p)
				if (!p) {
					console.log(`ยังไม่ได้กำหนดเปอร์เซนต์ให้ลูกค้า`);
				}

				const cost = Number(obj[ob].price);
				const price = Math.ceil(((cost * p.percent) / 100) + cost);

				v = {
					...obj[ob],
					price: price
				};
				new_data.push(v);
			} else {
				// ทำสิ่งที่คุณต้องการทำเมื่อ obj[ob].available เป็น false
				console.log(`Skipping ${obj[ob].courier_code} because available is false`);
			}
		}

		return res.status(200).send({ status: true, origin_data: req.body, data: new_data });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "Internal Server Error" })
	}
};