const router = require("express").Router();
const authCus = require("../../lib/auth.customer");
const { Customers } = require("../../model/user/customer.model");

router.post("/", authCus, async (req, res) => {
	const { decoded } = req;
	try {
		if (decoded && decoded.row === "Partner") {
			const id = decoded.id;
			const customer = await Customers.findOne({ _id: id });
			if (!customer) {
				return res.status(403).send({ status: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' })
			} else {
				return res.status(200).send({ status: true, data: customer });
			}
		}
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "Internal Server Error", status: false });
	}
});

module.exports = router;