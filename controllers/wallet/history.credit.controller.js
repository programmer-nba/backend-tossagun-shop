const { CreditHistory } = require("../../model/wallet/credit.history.model");

module.exports.create = async (req, res) => {
	try {
		const new_credit_history = new CreditHistory(req.body);
		if (!new_credit_history)
			return res.status(403).send({ message: "ไม่สามารถสร้างประวัติเครดิตได้", status: false });

		new_credit_history.save();
		return res.status(201).send({ message: "สร้างรายงานใหม่เเล้ว", status: true });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};

module.exports.getHistory = async (req, res) => {
	try {
		const history = await CreditHistory.find();
		if (!history)
			return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
		return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: history });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};

module.exports.getByShopId = async (req, res) => {
	try {
		const id = req.params.shopid;
		const pipelint = [
			{
				$match: { shop_id: id },
			},
		];
		const history = await CreditHistory.aggregate(pipelint);
		if (!history)
			return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
		return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: history });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};