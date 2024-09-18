const router = require("express").Router();
const slip = require("../../controllers/wallet/wallet.slip..controller");
const history = require("../../controllers/wallet/history.wallet.controller");
const wallet = require("../../controllers/wallet/wallet.controller");
const income = require("../../controllers/wallet/income.controller");
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.get("/image/:imgname", slip.getImage)

router.post("/slip", auth, slip.create);
router.get("/", auth, wallet.getWalletAll);
router.get("/shop/:shopid", auth, wallet.getWalletByShop);
router.get("/member/:memberid", auth, wallet.getWalletByMember);
router.put("/:id", authAdmin, slip.update);

// history
router.post("/history", auth, history.create);
router.get("/history", auth, history.getHistory);
router.get("/history/member/:makerid", auth, history.getByMakerId);
router.get("/history/shop/:shopid", auth, history.getByShopId);

// Income รายได้
router.get("/income", auth, income.getIncome);
router.get("/income/member/:makerid", auth, income.getByMakerId);
router.get("/income/shop/:shopid", auth, income.getByShopId);

module.exports = router;