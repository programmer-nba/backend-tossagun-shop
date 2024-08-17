const axios = require("axios");
const dayjs = require("dayjs");
const { Customers } = require("../../../model/user/customer.model");
const { OrderExpress } = require("../../../model/shippop/order.express.model");
const { shippopBooking } = require("../../../model/shippop/shippop.order");

module.exports.getPrice = async (req, res) => {
	try {
		const id = req.decoded.id;

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
				let v = null;
				let p = findCustomer.cus_function.find((el) => el.name === 'express');
				// console.log(p)
				if (!p) {
					console.log(`ยังไม่ได้กำหนดเปอร์เซนต์ให้ลูกค้า`);
				}

				const cost = Number(obj[ob].price);
				const price = Math.ceil(((cost * p.percent) / 100) + cost);

				v = {
					...obj[ob],
					price_remote_area: 0,
					cost_tg: cost,
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

module.exports.booking = async (req, res) => {
	try {
		const id = req.decoded.id;
		const value = {
			api_key: process.env.SHIPPOP_API_KEY,
			email: "tossagundigitalnewgeneration@gmail.com",
			url: {
				"success": "http://shippop.com/?success",
				"fail": "http://shippop.com/?fail"
			},
			data: req.body,
			force_confirm: 1
		};

		const resp = await axios.post(`${process.env.SHIPPOP_URL}/booking/`, value, {
			headers: {
				"Accept-Encoding": "gzip,deflate,compress",
				"Content-Type": "application/json"
			},
		});

		if (!resp.data.status) {
			return res.status(400).send({ status: false, message: resp.data.data[0] });
		}

		const invoice = await invoiceNumber();
		const obj = resp.data.data;
		const new_data = [];
		let cost = 0;

		// ค้นหาลูกค้า
		const findCustomer = await Customers.findOne({ _id: id });
		if (!findCustomer) {
			return res
				.status(404)
				.send({ status: false, message: "ไม่พบข้อมูลลูกค้าดังกล่าว" })
		}

		let p = findCustomer.cus_function.find((el) => el.name === 'express');
		// console.log(p)
		if (!p) {
			console.log(`ยังไม่ได้กำหนดเปอร์เซนต์ให้ลูกค้า`);
		}

		Object.keys(obj).forEach(async (ob) => {
			const percel = req.body[ob];
			const v = {
				...obj[ob],
				...percel,
				invoice: invoice,
				purchase_id: String(resp.data.purchase_id),
				shop_id: id,
				timestamp: dayjs(Date.now()).format(),
			};
			new_data.push(v);
			// cost += percel.cost;
			cost = Number(percel.cost);
		})

		const createOrderShippop = await shippopBooking.insertMany(new_data);
		if (!createOrderShippop) {
			console.log("ไม่สามารถสร้างข้อมูล booking ได้")
		}
		const wallet = findCustomer.cus_wallet - cost;
		const findShop = await Customers.findByIdAndUpdate(id, { cus_wallet: wallet }, { useFindAndModify: false })
		if (!findShop) {
			return res.status(404).send({ status: false, message: "ไม่สามารถค้นหาร้านที่ท่านระบุได้" })
		}
		return res.status(200).send({ status: true, data: resp.data })
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "Internal Server Error" })
	}
};

async function invoiceNumber() {
	const pipelint = [
		{
			$group: { _id: 0, count: { $sum: 1 } },
		},
	];
	const count = await OrderExpress.aggregate(pipelint);
	const countValue = count.length > 0 ? count[0].count + 1 : 1;
	const data = `TSP${dayjs(Date.now()).format("YYMMDD")}${countValue.toString().padStart(3, "0")}`;
	return data;
};

module.exports.labelHtml = async (req, res) => {
	try {
		const id = req.decoded.id;
		const { purchase_id } = req.body;
		if (purchase_id === undefined) {
			return res.status(400).send({ status: false, message: "รับข้อมูลไม่ครบถ้วน" });
		}
		const booking = await shippopBooking.find({
			purchase_id: purchase_id,
		});
		const tracking_code = [];
		let option = {};
		for (let i = 0; i < booking.length; i++) {
			if (booking[i].status !== "cancel") {
				tracking_code.push(booking[i].tracking_code);
			}
			option[booking[i].tracking_code] = {
				replaceOrigin: { ...booking[i].origin },
			};
		}
		const value = {
			api_key: process.env.SHIPPOP_API_KEY,
			purchase_id: purchase_id,
			tracking_code: String(tracking_code),
			size: "sticker4x6",
			// logo: "https://nbadigitalworlds.com/img/nba-express2.png",
			type: "html",
			options: option,
		};
		const resp = await axios.post(`${process.env.SHIPPOP_URL}/v2/label/`, value, {
			headers: { "Accept-Encoding": "gzip,deflate,compress" },
		});
		return res.status(200).send(resp.data);
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "Internal Server Error" })
	}
};

module.exports.dropoff = async (req, res) => {
	try {
		const value = {
			api_key: process.env.SHIPPOP_API_KEY,
			email: "tossagundigitalnewgeneration@gmail.com",
			data: req.body,
		};

		const resp = await axios.post(`${process.env.SHIPPOP_URL}/booking/`, value, {
			headers: {
				"Accept-Encoding": "gzip,deflate,compress",
				"Content-Type": "application/json"
			},
		});

		return res.status(200).send(resp.data);
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "Internal Server Error" })
	}
};