const dayjs = require("dayjs");
const { OrderTopup } = require("../../../model/topup/order.topup");
const { PercentTopup } = require("../../../model/topup/topup.percent");
const { AWSBooking } = require("../../../model/topup/aws.order");
const { Customers } = require("../../../model/user/customer.model");

module.exports.booking = async (req, res) => {
	try {
		const id = req.decoded.id;

		// ค้นหาลูกค้า
		const findCustomer = await Customers.findOne({ _id: id });
		if (!findCustomer) {
			return res
				.status(404)
				.send({ status: false, message: "ไม่พบข้อมูลลูกค้าดังกล่าว" })
		}

		const amount = req.body.reduce((sum, el) => sum + el.amount, 0);
		if (findCustomer.cus_wallet < amount) {
			return res.status(405).send({ status: false, message: 'ยอดเงินไม่เพียงพอต่อการทำรายการ' })
		}

		const invoice = await invoiceNumber();
		const ref_number = await runreference_order();
		const new_data = [];
		let total = 0;
		for (let item of req.body) {
			// const percent = await PercentTopup.findOne({ topup_id: item.service_id });

			const value = {
				reference_order: ref_number,
				amount: item.amount,
				branch: process.env.TOPUP_USERNAME,
				service_id: item.service_id,
				mobile: item.mobile,
				ref1: invoice,
			};

			// const resp = await axios.post(`${process.env.TOPUP_URL}`, value, {
			// headers: {
			// "Content-Type": "application/json",
			// "Authorization": `Bearer ${process.env.TOPUP_TOKEN}`
			// },
			// });

			// console.log(res)

			const v = {
				...item,
				invoice: invoice,
				ref_number: ref_number,
				shop_id: id,
				// employee_id: req.body.employee,
				// type_payment: req.body.paymenttype,
				// tossagun_tel: req.body.platform,
				// order_id: resp.data.order_id,
				// order_status: resp.data.status,
				timestamp: dayjs(Date.now()).format(),
			};
			new_data.push(v);
			total += item.amount;
		}

		const wallet = findCustomer.cus_wallet - total;
		await Customers.findByIdAndUpdate(id, { cus_wallet: wallet }, { useFindAndModify: false }).then((data) => {
			if (!data) {
				return res.status(405).send({ status: false, message: 'ตัดเงินจากกระเป๋าไม่สำเร็จ' })
			}
		});

		const createOrder = await AWSBooking.insertMany(new_data);
		if (!createOrder) {
			console.log("ไม่สามารถสร้างข้อมูล booking ได้")
		}
		return res.status(200).send({ status: true, data: new_data, ref: ref_number })
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
	const count = await OrderTopup.aggregate(pipelint);
	const countValue = count.length > 0 ? count[0].count + 1 : 1;
	const data = `TOPUP${dayjs(Date.now()).format("YYMMDD")}${countValue.toString().padStart(3, "0")}`;
	return data;
};

async function runreference_order() {
	// สุ่มเลขอ้างอิง 10 หลัก
	let reference_order = Math.floor(1000000000 + Math.random() * 9000000000);
	return reference_order;
};