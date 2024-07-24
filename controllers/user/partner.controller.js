const { Partners, validate } = require("../../model/user/partner.model");

module.exports.create = async (req, res) => {
	try {
		const { error } = validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message, status: false });

		const partner = await Partners.findOne({
			partner_firstname: req.body.partner_firstname,
			partner_lastname: req.body.partner_lastname,
			partner_username: req.body.partner_username,
		});
		if (partner) {
			return res.status(409).send({ status: false, message: "มีชื่อผู้ใช้งานนี้ในระบบเเล้ว" });
		} else {
			const salt = await bcrypt.genSalt(Number(process.env.SALT));
			const hashPassword = await bcrypt.hash(req.body.partner_password, salt);

			await new Partners({
				...req.body,
				partner_password: hashPassword,
			}).save();
			return res.status(201).send({ message: "สร้างข้อมูลสำเร็จ", status: true });
		}
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
	}
};