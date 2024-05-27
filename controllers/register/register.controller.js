const { Members } = require("../../model/user/member.model");
const jwt = require("jsonwebtoken");

module.exports.getToken = async (req, res) => {
	try {
		if (req.user.row === 'member') {
			const member = await Members.findOne({ tel: req.user.tel });
			if (!member) {
				return res.status(403).send({ status: false, message: 'ไม่พบข้อมูลสมาชิก' })
			} else {
				const token = jwt.sign(
					{ name: member.fristname, tel: member.tel },
					process.env.JWTPRIVATEKEY,
					{ expiresIn: "1h", }
				);
				return res.status(200).send({ status: true, message: 'สร้าง Token สำเร็จ', token: token });
			}
		}
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};