const router = require("express").Router();
const member = require("../../controllers/user/member.controller");

router.post("/verify", member.verify); //ส่ง otp
router.post("/check/otp", member.check); //ตรวจสอบ otp

router.get("/check/:tel", member.checkTel); //ตรวจสอบ otp
router.post("/create", member.create); //สร้าง user

router.get("/", member.getMemberAll);
router.get("/:id", member.getMemberById);
router.get("/team/:tel", member.getMemberTeam);
router.put("/:id", member.update);

module.exports = router;