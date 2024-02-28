const router = require("express").Router();
const poshop = require("../../controllers/pos/preorder.controller/preorder.shop.controller");

router.post("/shopcutoff", poshop.cutoff);

module.exports = router;