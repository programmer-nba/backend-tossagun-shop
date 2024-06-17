const router = require("express").Router();
const invset = require("../../controllers/pos/shop.controller/partner.invest.shop.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.get("/image/:imgname", invset.getImage);

router.post("/", invset.invset);
router.get("/", invset.getInvestAll);
router.get("/:id", invset.getInvestById);

module.exports = router;