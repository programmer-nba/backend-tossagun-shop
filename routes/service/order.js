const router = require("express").Router();
const order = require("../../controllers/service.controller/order/order.service.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

// router.get("/", auth, order.getOrderList);
// router.get("/:id", auth, order.getOrderById);

// Confirm Order
router.put("/confirm/:id", order.confirmOrder);
router.put("/submit/:id", order.submitOrder);

// Order Tricket AOC
router.get("/aoc", auth, order.getOrderAoc);
router.get("/aoc/:makerid", auth, order.getOrderByMakerId);
// router.get("/aoc/:id", auth, order.getOrderAocById);

// Order Express 
router.get("/express", auth, order.getOrderExpress);
router.get("/express/:shopid", auth, order.getOrderByShopId);
router.get("/express/purchase/:id", auth, order.getOrderPurchaseId);

// Order AppPremium
router.get("/apppremium", auth, order.getOrderAppPremium);
router.get("/apppremium/:shopid", auth, order.getOrderAppByShopId);

// Order Topup
router.get("/topup", auth, order.getOrderTopup);
router.get("/topup/:shopid", auth, order.getOrderTopupByShopId);
router.get("/topup/orderid/:id", auth, order.getOrderByOrderId);

// Order
router.get("/", auth, order.getOrderService);
router.put("/:id", auth, order.updateOrder);
router.get("/orderref/:invoice", auth, order.getOrderByInvoice);
router.put("/orderref/book/:id", auth, order.updateOrderRefBook);
router.put("/orderref/iden/:id", auth, order.updateOrderRefIden);
router.get("/shop/:shopid", auth, order.getByShopId);
router.get("/maker/:makerid", auth, order.getByMakerId);

module.exports = router;