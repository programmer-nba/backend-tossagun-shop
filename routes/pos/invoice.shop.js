const router = require("express").Router();
const invoice = require("../../controllers/pos/invoice.shop.controller/invoice.shop.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.get("/image/:imgname", invoice.getImage);

router.post("/", auth, invoice.create);

router.get("/", authAdmin, invoice.findInvoiceAll);
router.get("/:id", auth, invoice.findInvoiceById);
router.get("/shop/:shopid", auth, invoice.findInvoiceByShopId);

router.put("/:id", auth, invoice.updateInvoice);

module.exports = router;