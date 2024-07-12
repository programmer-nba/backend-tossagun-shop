const router = require("express").Router();
const history = require("../../controllers/wallet/history.credit.controller");
const auth = require("../../lib/auth");

router.post("/history", auth, history.create);
router.get("/history", auth, history.getHistory);
router.get("/history/shop/:shopid", auth, history.getByShopId);

module.exports = router;