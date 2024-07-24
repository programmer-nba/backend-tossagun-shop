require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = checkToken = async (req, res, next) => {
	let token = req.headers["auth-token"];
	if (token) {
		jwt.verify(token, process.env.JWTPARTNERKEY, (err, decoded) => {
			if (err) {
				return res.status(408).json({
					success: false,
					message: "หมดเวลาใช้งานแล้ว หรือ ไม่มีสิทธิการใช้ดังกล่าว",
					logout: true,
					description: "Request Timeout Or There is no such right to use.",
				});
			}
			req.decoded = decoded;
			next();
		})
	} else {
		return res.status(401).json({
			success: false,
			message: "Token not provided Token ไม่ถูกต้อง",
			logout: false,
			description: "Unauthorized",
		});
	}
};