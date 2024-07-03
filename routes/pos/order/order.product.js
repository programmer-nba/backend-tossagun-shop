const router = require("express").Router();
const order = require("../../../controllers/pos/order.controller/order.product.controller");
const auth = require("../../../lib/auth");

router.post("/", auth, order.create);
router.get("/", auth, order.findAll);
router.get("/:id", auth, order.findById);
router.put("/:id", auth, order.update);
router.get("/shopid/:shopid", auth, order.findByShopId);
router.get("/dealerid/:dealerid", order.findByDealerId);
router.get("/store-id/:store_id", auth, order.findByStoreId);
router.get("/ponba/:ponba_id", auth, order.findByPoNbaId);

router.put("/confirm/:id", order.confrimOrder);
router.put("/tracking/:id", order.confrimTracking);

router.post("/import/:id", auth, order.ImportProduct);

module.exports = router;
