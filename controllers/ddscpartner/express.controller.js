const axios = require("axios");
const dayjs = require("dayjs");
const { PercentCourier } = require("../../model/shippop/percent.model");
const { OrderExpress } = require("../../model/shippop/order.express.model");
const { shippopBooking } = require("../../model/shippop/shippop.order");
const { Commission } = require("../../model/pos/commission/commission.model");
const { Members } = require("../../model/user/member.model");
const commissions = require("../../function/commission");

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
		const invoice = await invoiceNumber();

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

		const resp = await axios.post(`${process.env.SHIPPOP_URL}/booking/`, value, {
			headers: {
				"Accept-Encoding": "gzip,deflate,compress",
				"Content-Type": "application/json"
			},
		});

		if (!resp.data.status) {
			return res.status(400).send({ status: false, message: resp.data.data[0] });
		}

		const obj = resp.data.data;
		const new_data = [];

		let cost_tg = 0;
		let cost = 0;
		let total = 0;
		let total_platform = 0;
		let cod = 0;
		let cod_charge = 0;
		let cod_vat = 0;

		Object.keys(obj).forEach(async (ob) => {
			const percel = req.body.product_detail[ob];
			const v = {
				...obj[ob],
				...percel,
				invoice: invoice,
				purchase_id: String(resp.data.purchase_id),
				shop_id: req.body.shop_id,
				// employee_id: req.body.employee,
				// type_payment: req.body.paymenttype,
				tossagun_tel: req.body.platform,
				timestamp: dayjs(Date.now()).format(),
			};
			new_data.push(v);
			cost_tg += percel.cost_tg;
			cost += percel.cost;
			total += percel.total;
			total_platform += percel.total_platform;
			cod += percel.cod_amount;
			cod_charge += percel.price_cod;
			cod_vat += percel.price_cod_vat;
		});

		const o = {
			shop_id: req.body.shop_id,
			platform: req.body.platform,
			invoice: invoice,
			type: "Express",
			total: Number(total.toFixed(2)),
			total_cost: Number(cost.toFixed(2)),
			total_cost_tg: Number(cost_tg.toFixed(2)),
			total_platform: total_platform,
			total_cod: Number(cod.toFixed(2)),
			total_cod_charge: Number(cod_charge.toFixed(2)),
			total_cod_vat: Number(cod_vat.toFixed(2)),
			total_box: 0,
			// payment_type: req.body.paymenttype,
			// moneyreceive: req.body.moneyreceive,
			// change: req.body.change,
			// discount: req.body.discount,
			purchase_id: String(resp.data.purchase_id),
			// employee: req.body.employee,
			status: [
				{ name: "ชำระเงิน", timestamp: dayjs(Date.now()).format() }
			],
			timestamp: dayjs(Date.now()).format(),
		};

		const createOrder = await OrderExpress.create(o);
		const createOrderShippop = await shippopBooking.insertMany(new_data);

		if (!createOrderShippop && !createOrder && !createOrderBox) {
			console.log("ไม่สามารถสร้างข้อมูล booking ได้")
			return res.status(405).send({ status: false, message: "ทำรายการไม่สำเร็จ" })
		}

		const getteammember = await GetTeamMember(req.body.platform);
		if (!getteammember) {
			return res.status(403).send({ message: "ไม่พบข้อมมูลลูกค้า" });
		} else {
			const commissionData = await commissions.Commission(createOrder, total_platform, getteammember, 'Express', total);
			const commission = new Commission(commissionData);

			if (!commission) {
				return res.status(403).send({ status: false, message: 'ไม่สามารถจ่ายค่าคอมมิชชั่นได้' });
			} else {
				commission.save();
			}

			return res.status(200).send({ status: true, data: obj})
		}
	} catch (error) {
		console.log(error)
		return res.status(500).send({ status: false, message: error.message })
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

async function GetTeamMember(tel) {
	try {
		const member = await Members.findOne({ tel: tel });
		if (!member) {
			return res
				.status(403)
				.send({ message: "เบอร์โทรนี้ยังไม่ได้เป็นสมาชิกของทศกัณฐ์แฟมมิลี่" });
		} else {
			const upline = [member.upline.lv1, member.upline.lv2, member.upline.lv3];
			const validUplines = upline.filter((item) => item !== "-");
			const uplineData = [];
			let i = 0;
			for (const item of validUplines) {
				const include = await Members.findOne({ _id: item });
				if (include !== null) {
					uplineData.push({
						iden: include.iden.number,
						name: include.fristname,
						address: {
							address: include.address,
							subdistrict: include.subdistrict,
							district: include.district,
							province: include.province,
							postcode: include.postcode,
						},
						tel: include.tel,
						level: i + 1,
					});
					i++;
				}
			}
			const owner = {
				iden: member.iden.number,
				name: member.fristname,
				address: {
					address: member.address,
					subdistrict: member.subdistrict,
					district: member.district,
					province: member.province,
					postcode: member.postcode,
				},
				tel: member.tel,
				level: "owner",
			};
			const data = [
				owner || null,
				uplineData[0] || null,
				uplineData[1] || null,
				uplineData[2] || null,
			];
			return data
		}
	} catch (error) {
		console.log(error)
		return res.status(500).send({ status: false, error: error.message });
	}
};