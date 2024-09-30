const router = require("express").Router();
const tax = require("../../controllers/service.controller/tax/tax.controller");
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.get("/image/:imgname", tax.getImage);

router.post("/", authAdmin, tax.create);
router.get("/", auth, tax.getProductAll);
router.get("/:id", auth, tax.getProductById);
router.put("/:id", authAdmin, tax.update);
router.delete("/:id", authAdmin, tax.delete);

router.post("/order",auth, tax.createOrder);

module.exports = router;