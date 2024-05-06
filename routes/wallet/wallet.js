const router = require("express").Router();
const slip = require("../../controllers/wallet/wallet.slip..controller");
const history = require("../../controllers/wallet/history.wallet.controller");
const invoice = require("../../controllers/wallet/invoice.wallet.controller");
const wallet = require("../../controllers/wallet/wallet.controller");
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.get("/image/:imgname", slip.getImage)

router.post("/invoice", invoice.create);

router.post("/slip", auth, slip.create);
router.get("/", auth, wallet.getWalletAll);
router.get("/:memberid", auth, wallet.getWalletByMember);
router.put("/:id", authAdmin, slip.update);

// history
router.post("/history", auth, history.create);
router.get("/histiry", auth, history.getHistory)

module.exports = router;