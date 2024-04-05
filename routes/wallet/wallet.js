const router = require("express").Router();
const slip = require("../../controllers/wallet/wallet.slip..controller");
const invoice = require("../../controllers/wallet/invoice.wallet.controller");
const wallet = require("../../controllers/wallet/wallet.controller");
const authAdmin = require("../../lib/auth.admin");
const auth = require("../../lib/auth");

router.post("/invoice", invoice.create);

router.post("/slip", auth, slip.create);
router.get("/", auth, wallet.getWalletAll);

module.exports = router;