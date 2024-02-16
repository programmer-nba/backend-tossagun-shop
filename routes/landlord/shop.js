const router = require("express").Router();
const invesments = require("../../controllers/invesment.controll/invesment.controller");
const shop = require("../../controllers/invesment.controll/shop.controller");
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin");

router.get("/all", authAdmin, invesments.getShopAll);
router.get("/:id", auth, invesments.getShopById);
router.get("/landlordId/:landlord_id", auth, invesments.getMoneyByLandlordId);

router.post("/", shop.create);
router.put("/confirm/:id", authAdmin, shop.update);
router.put("/cancel/:id", authAdmin, shop.cancel);

module.exports = router;
