const router = require("express").Router();
const order = require("../../controllers/service.controller/order/order.service.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.get("/", auth, order.getOrderList);
// router.get("/:id", auth, order.getOrderById);
router.get("/aoc", auth, order.getOrderAoc);
router.get("/aoc/:makerid", auth, order.getOrderByMakerId);
// router.get("/aoc/:id", auth, order.getOrderAocById);

module.exports = router;