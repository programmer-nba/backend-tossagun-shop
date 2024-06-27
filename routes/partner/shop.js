const router = require("express").Router();
const shops = require("../../controllers/pos/shop.controller/shop.controller");
const employees = require("../../controllers/user/employee.controller");
const createShop = require("../../controllers/pos/shop.controller/partner.create.shop.controller");
const updateShop = require("../../controllers/pos/shop.controller/update.shop.controller");

router.post("/shop/create", createShop.create);
router.get("/shop", shops.findAll);
router.get("/shop/:partnerid", shops.findByPartnerId);
router.get("/shop/shop/:id", shops.findOne);
router.put("/shop/shop/:id", updateShop.update);
router.delete("/shop/shop/:id", shops.delete);

router.post("/shop/employee", employees.create);
router.get("/employee/shop/:shopid", employees.findByShopId);
router.get("/shop/employee/:id", employees.findById);
router.put("/shop/employee/:id", employees.update);
router.delete("/shop/employee/:id", employees.delete);

router.get("/shop/wallet/:shopid", shops.getWalletHistory);
router.get("/shop/express/:shopid", shops.getExpressAll);

module.exports = router;