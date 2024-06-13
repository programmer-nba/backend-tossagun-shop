const router = require("express").Router();
const easybook = require("../../controllers/easybook/easybook.service")
const auth = require("../../lib/auth");
const authAdmin = require("../../lib/auth.admin")

// router.get("/get/token", auth, easybook.getToken);
router.get("/get/signature", easybook.signature);
//รถบัส
// จังหวัด รถบัส
router.get("/bus/province", easybook.getProvince);
// สถานีรถบัส
router.get("/bus/subplaces", easybook.getBusStation);
//เช็คเที่ยวรถบัส
router.post("/bus/checktrip", easybook.gettrips);
//เรียกดูที่นั่ง
router.post("/bus/checkseat", easybook.getseat);
//เช็คราคา 
router.post("/bus/checkprice", easybook.getbookingfare);

//จองที่นั่งรถบัส
router.post("/bus/booking", easybook.getbooking);
// ดึงออเดอร์การจองรถบัส
router.get("/bus/getorder", easybook.getorder);


module.exports = router;