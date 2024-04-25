const router = require("express").Router();
const ProductExpress = require("../../controllers/shippop/product.express.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.post("/", auth, ProductExpress.create);
router.get("/", authAdmin, ProductExpress.getAll);
router.get("/shop_id/:shopid", auth, ProductExpress.getByShopId);
router.get("/:id", auth, ProductExpress.getById);
router.put("/:id", auth, ProductExpress.update);
router.delete("/:id", auth, ProductExpress.delete);

module.exports = router;