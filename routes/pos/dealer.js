const router = require("express").Router();
const createDealer = require("../../controllers/pos/dealer.controller/create.dealer.controller");
const updateDealer = require("../../controllers/pos/dealer.controller/update.dealer.controller");
const dealer = require("../../controllers/pos/dealer.controller/dealer.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

// เพิ่ม Dealer โดย Admin
// router.post("/", authAdmin, createDealer.create);

module.exports = router;
