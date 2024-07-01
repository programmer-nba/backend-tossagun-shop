const router = require("express").Router();
const partner = require("../../controllers/partner/partner.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

// ดึงข้อมูลพาร์ทเนอร์
router.get("/", partner.getPartnerAll);
router.get("/:id", partner.getPartnerById);

module.exports = router;