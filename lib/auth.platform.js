require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = checkToken = async (req, res, next) => {
    let token = req.headers["auth-token"];
    if (token) {
        token = token.replace(/^Bearer\s+/, "");
        jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
            if (err) {
                return res.status(408).json({
                    success: false,
                    message: "หมดเวลาใช้งานแล้ว หรือ สิทธิการใช้งานเฉพาะ platform",
                    logout: true,
                    description: "Request Timeout Or Platform Only",
                });
            }
            req.decoded = decoded;
            if (decoded.key !== "platform_tossagun") {
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
