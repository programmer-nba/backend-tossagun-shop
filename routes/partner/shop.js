const router = require("express").Router();
const shops = require("../../controllers/pos/shop.controller/shop.controller");
const employees = require("../../controllers/user/employee.controller");
const createShop = require("../../controllers/pos/shop.controller/partner.create.shop.controller");

router.post("/shop/create", createShop.create);
router.get("/shop/:partnerid", shops.findByPartnerId);

router.post("/shop/employee", employees.create);
router.get("/shop/employee", employees.findAll);
router.get("/shop/employee/:id", employees.findById);
router.put("/shop/employee/:id", employees.update);
router.delete("/shop/employee/:id", employees.delete);

module.exports = router;