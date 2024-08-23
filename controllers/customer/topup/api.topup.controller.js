const { OrderTopup } = require("../../../model/topup/order.topup");
const { PercentTopup } = require("../../../model/topup/topup.percent");

module.exports.booking = async (req, res) => {
	try {
		const invoice = await invoiceNumber();
		const ref_number = await runreference_order();

		for (let item of req.body.product_detail) {
			const percent = await PercentTopup.findOne({ topup_id: item.service_id });

			const value = {
				reference_order: ref_number,
				amount: item.amount,
				branch: process.env.TOPUP_USERNAME,
				service_id: item.service_id,
				mobile: item.mobile,
				ref1: invoice,
			};

			const resp = await axios.post(`${process.env.TOPUP_URL}`, value, {
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${process.env.TOPUP_TOKEN}`
				},
			});
		}

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