const router = require("express").Router();
const shops = require("../../controllers/pos/shop.controller/shop.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.get("/landlord/:id", shops.findByLandlord);
router.get("/investor/:id", shops.findByInvestor);
router.get("/partner/:id", shops.findByPartnerId);

router.post("/", authAdmin, shops.create);
router.get("/", authAdmin, shops.findAll);
router.get("/:id", auth, shops.findOne);

router.delete("/:id", authAdmin, shops.delete);

module.exports = router;
