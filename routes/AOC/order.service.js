const router = require("express").Router();
const aoc = require("../../controllers/AOC/aoc.order.service.controller");
const auth = require("../../lib/auth");

router.post("/get/ticket", auth, aoc.getFlightTicket);
router.post("/get/price", auth, aoc.getPriceTicket);
router.post("/booking", auth, aoc.getBooking);
router.post("/get/flight/booking", aoc.getFlightBooking);
router.post("/update/payment", auth, aoc.updatePayment);
router.post("/confirm/:id", auth, aoc.confirmAOC);
// router.get("/store-id/:store_id", auth, order.findByStoreId);
// router.get("/ponba/:ponba_id", auth, order.findByPoNbaId);

module.exports = router;