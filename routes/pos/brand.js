const router = require("express").Router();
const brand = require("../../controllers/pos/brand.controller/brand.controller");
const createBrand = require("../../controllers/pos/brand.controller/create.brand.controller");
const updateBrand = require("../../controllers/pos/brand.controller/update.brand.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.get("/dealer/:id", auth, brand.findByDealer);

router.post("/", createBrand.create);

router.get("/", auth, brand.findAll);
router.get("/:id", auth, brand.findOne);

router.delete("/:id", authAdmin, brand.delete);
router.put("/:id", auth, updateBrand.update);

module.exports = router;
