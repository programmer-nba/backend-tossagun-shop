const router = require("express").Router();
const invset = require("../../controllers/pos/shop.controller/partner.invest.shop.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.get("/image/:imgname", invset.getImage);

router.post("/", invset.invset);

// อนุมัติ
router.post("/approve/:id", invset.approve);
router.post("/cancel/:id", invset.cancel);

router.get("/", invset.getInvestAll);
router.get("/:id", invset.getInvestById);
router.get("/partner/:partnerid", invset.getInvestByPartnerId);

module.exports = router;