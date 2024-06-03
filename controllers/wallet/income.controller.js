const { WalletHistory } = require("../../model/wallet/wallet.history.model");

exports.getIncome = async (req, res) => {
	try {
		const pipelint = [
			{
				$match: { category: 'Income' },
			},
		];
		const income = await WalletHistory.aggregate(pipelint);
		if (!income)
			return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
		return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: income });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};

exports.getByMakerId = async (req, res) => {
	try {
		const id = req.params.makerid;
		const pipelint = [
			{
				$match: {
					$and: [
						{ category: 'Income' },
						{ maker_id: id },
					]
				},
			},
		];
		const income = await WalletHistory.aggregate(pipelint);
		if (!income)
			return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
		return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: income });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};

exports.getByShopId = async (req, res) => {
	try {
		const id = req.params.shopid;
		const pipelint = [
			{
				$match: {
					$and: [
						{ category: 'Income' },
						{ shop_id: id }
					]
				},
			},
		];
		const income = await WalletHistory.aggregate(pipelint);
		if (!income)
			return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
		return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: income });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
}