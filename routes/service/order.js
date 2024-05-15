const router = require("express").Router();
const order = require("../../controllers/service.controller/order/order.service.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

// router.get("/", auth, order.getOrderList);
// router.get("/:id", auth, order.getOrderById);

// Confirm Order
router.put("/:id", order.confirmOrder);

// Order Tricket AOC
router.get("/aoc", auth, order.getOrderAoc);
router.get("/aoc/:makerid", auth, order.getOrderByMakerId);
// router.get("/aoc/:id", auth, order.getOrderAocById);

// Order Express 
router.get("/express", auth, order.getOrderExpress);
router.get("/express/:shopid", auth, order.getOrderByShopId);
router.get("/express/purchase/:id", auth, order.getOrderPurchaseId);

// Order
router.get("/", auth, order.getOrderService);
router.get("/orderref/:invoice", auth, order.getOrderByInvoice);
router.put("/orderref/book/:id", auth, order.updateOrderRefBook);
router.put("/orderref/iden/:id", auth, order.updateOrderRefIden);
router.get("/shop/:shopid", auth, order.getByShopId);
router.get("/maker/:makerid", auth, order.getByMakerId);

module.exports = router;