const router = require("express").Router();
const aoc = require("../../controllers/AOC/aoc.order.service.controller");
const auth = require("../../lib/auth");

router.get("/get/ticket",auth, aoc.getFlightTicket);
router.get("/get/price", auth, aoc.getPriceTicket);
router.post("/booking", auth, aoc.getBooking);
router.get("/get/flight/booking", auth, aoc.getFlightBooking);
// router.put("/update/payment", auth, aoc.updatePayment);
router.put("/confirm/:id", auth, aoc.confirmAOC);
// router.get("/store-id/:store_id", auth, order.findByStoreId);
// router.get("/ponba/:ponba_id", auth, order.findByPoNbaId);

module.exports = router;