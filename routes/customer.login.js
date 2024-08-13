const router = require("express").Router();
const bcrypt = require("bcrypt");
const Joi = require("joi");

const { Customers } = require("../model/user/customer.model");

const validate = (data) => {
	const schema = Joi.object({
		username: Joi.string().required().label("username"),
		password: Joi.string().required().label("password"),
	});
	return schema.validate(data);
};

router.post("/", async (req, res) => {
	try {
		const { error } = validate(req.body);
		if (error) return res.status(400).send({ message: error.details[0].message });

		const customer = await Customers.findOne({
			cus_email: req.body.username,
		});
		if (!customer) {
			return res.status(504).send({ status: false, message: "ไม่พบข้อมูลผู้ใช้งานดังกล่าว" })
		} else {
			const validPasswordAdmin = await bcrypt.compare(
				req.body.password,
				customer.cus_password,
			);
			if (!validPasswordAdmin) {
				// รหัสไม่ตรง
				return res.status(401).send({
					message: "รหัสผ่านไม่ถูกต้อง",
					status: false,
				});
			} else {
				return res.status(200).send({
					token: customer.cus_token,
					message: "เข้าสู่ระบบสำเร็จ",
					level: "customer",
					status: true,
				});
			}
		}
	} catch (error) {
		console.log(error)
		return res.status(500).send({ status: false, message: "Internal Server Error" });
	}
});

module.exports = router;