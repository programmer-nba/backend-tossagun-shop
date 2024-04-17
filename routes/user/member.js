const router = require("express").Router();
const member = require("../../controllers/user/member.controller");

router.post("/verify", member.verify); //ส่ง otp
router.post("/check/otp", member.check); //ตรวจสอบ otp

router.get("/check/:tel", member.checkTel); //ตรวจสอบ otp
router.post("/create", member.create); //สร้าง user

module.exports = router;