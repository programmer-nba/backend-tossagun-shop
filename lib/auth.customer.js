require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = checkToken = async (req, res, next) => {
	let token = req.headers["auth-token"];
	if (!token) {
		return res.status(401).send({ message: "invalid request" });
	}
	if (token) {
		token = token.replace(/^Bearer\s+/, "");
		jwt.verify(token, process.env.JWTPARTNERKEY, (err, decoded) => {
			req.user = decoded;
			if (err)
				return res.status(408).json({
					success: false,
					message: "หมดเวลาใช้งานแล้ว",
					logout: true,
					description: "Request Timeout",
				});
			req.decoded = decoded;
			if (decoded.row !== "Partner") {
				return res.status(401).json({
					success: false,
					message: "ไม่มีสิทธิใช้งานฟังก์ชั่นนี้",
					logout: true,
					description: "Unauthorized",
				});
			}
			next();
		});
	} else {
		return res.status(401).json({
			success: false,
			message: "Token not provided Token ไม่ถูกต้อง",
			logout: false,
			description: "Unauthorized",
		});
	}
};
