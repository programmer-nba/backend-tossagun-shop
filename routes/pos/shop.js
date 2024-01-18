const router = require("express").Router();
const shop = require("../../controllers/pos/shop/shop.controller");
const createShop = require("../../controllers/pos/shop/create.shop.controller");
const updateShop = require("../../controllers/pos/shop/update.shop.controller");
// const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.get("/partner/:id", authAdmin, shop.findByPartner);
router.post("/", authAdmin, createShop.create);

router.get("/", authAdmin, shop.findAll);
router.get("/:id", authAdmin, shop.findOne);

router.delete("/:id", authAdmin, shop.delete);
router.put("/:id", authAdmin, updateShop.update);

module.exports = router;
