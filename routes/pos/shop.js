const router = require("express").Router();
const shops = require("../../controllers/pos/shop.controller/shop.controller");
const createShop = require("../../controllers/pos/shop.controller/create.shop.controller");
const updateShop = require("../../controllers/pos/shop.controller/update.shop.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.get("/landlord/:id", shops.findByLandlord);
router.get("/investor/:id", shops.findByInvestor);
router.post("/create", authAdmin, createShop.create);

router.get("/", authAdmin, shops.findAll);
router.get("/:id", auth, shops.findOne);

router.delete("/:id", authAdmin, shops.delete);
router.put("/:id", auth, updateShop.update);

module.exports = router;
