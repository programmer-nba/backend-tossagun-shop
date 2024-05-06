const router = require("express").Router();
const easybook = require("../../controllers/easybook/easybook.service")
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin")

router.get("/get/token", auth, easybook.getToken);
// router.post("/booking", BookingShippop.booking);
// router.post('/label', auth, BookingShippop.label);
// router.post("/confirm", auth, BookingShippop.confirm);
// router.post("/cancel", auth, BookingShippop.cancel);
// router.get("/booking/:shop_id", auth, BookingShippop.getBooking);
// router.get('/booking', authAdmin, BookingShippop.getAllBooking);
// router.post("/shippop/callback", BookingShippop.callback);
// router.post('/tracking', auth, BookingShippop.checkTrackingCode);
// router.post('/tracking/update/courier_tracking_code', authAdmin, BookingShippop.updateCourierTrackingCode);
// router.post('/calltopickup', authAdmin, BookingShippop.callToPickup);

module.exports = router;