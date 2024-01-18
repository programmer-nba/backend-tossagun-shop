const router = require("express").Router();
const shop = require("../../controllers/pos/shop/shop.controller");
const createShop = require("../../controllers/pos/shop/create.shop.controller");
const updateShop = require("../../controllers/pos/shop/update.shop.controller");
// const auth = require("../../lib/auth");
// const authAdmin = require('../../lib/auth.admin')

router.get("/partner/:id", shop.findByPartner);
router.post("/", createShop.create);

router.get("/", shop.findAll);
router.get("/:id", shop.findOne);

router.delete("/:id", shop.delete);
router.put("/:id", updateShop.update);

module.exports = router;
