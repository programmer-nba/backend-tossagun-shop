const router = require("express").Router();
const shops = require("../../controllers/pos/shop.controller/shop.controller");
const createShop = require("../../controllers/pos/shop.controller/partner.create.shop.controller");

router.post("/shop/create", createShop.create);
router.get("/shop/:partnerid", shops.findByPartnerId);

module.exports = router;