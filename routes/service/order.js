const router = require("express").Router();
const order = require("../../controllers/service.controller/order/order.service.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.get("/", auth, order.getOrderList);
// router.get("/:id", auth, order.getOrderById);

// Order Tricket AOC
router.get("/aoc", auth, order.getOrderAoc);
router.get("/aoc/:makerid", auth, order.getOrderByMakerId);
// router.get("/aoc/:id", auth, order.getOrderAocById);

// Order Express 
router.get("/express", auth, order.getOrderExpress);
router.get("/express/:shopid", auth, order.getOrderByShopId);

// Order Artwork
router.get("/artwork", auth, order.getOrderArtwork);
router.get("/artwork/shop/:shopid", auth, order.getByShopId);
router.get("/artwork/maker/:makerid", auth, order.getByMakerId);

module.exports = router;