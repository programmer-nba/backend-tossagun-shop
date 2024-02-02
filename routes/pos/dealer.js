const router = require("express").Router();
const createDealer = require("../../controllers/pos/dealer.controller/create.dealer.controller");
const updateDealer = require("../../controllers/pos/dealer.controller/update.dealer.controller");
const dealer = require("../../controllers/pos/dealer.controller/dealer.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

// เพิ่ม Dealer โดย Admin
router.post("/", createDealer.create);
router.get("/", auth, dealer.findAll);
router.get("/:id", auth, dealer.findOne);
router.delete("/:id", auth, dealer.delete);
router.put("/:id", authAdmin, updateDealer.update);

module.exports = router;
