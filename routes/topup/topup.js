const router = require("express").Router();

const topup = require('../../controllers/topup/topup.controller')
const topups = require("../../controllers/topup/topup.service.controller");
const auth = require("../../lib/auth");

router.get("/mobile", auth, topups.getTopupMobile);


//gentoken
router.post("/gentoken", topup.gentoken);

// เติมเงิน ais 
router.post("/topupais", topup.topup_ais);

// เติมเงิน dtac
router.post("/topupdtac", topup.topup_dtac);

// เติมเงิน truemove
router.post("/topuptruemove", topup.topup_truemove);

// เติมเงิน mycat
router.post("/topupmycat", topup.topup_mycat);

// เติมเงิน true wallet
router.post("/topuptruewallet", topup.topup_truewallet);

// ซื้อบัตร true money
router.post("/truemoney", topup.topup_truemoney);

// ซื้อบัตรเติมเงิน 12call
router.post("/topup12call", topup.topup_12call);

// เติมเงิน shopeepay
router.post("/topupshopeepay", topup.topup_shopeepay);

// เติมเงิน rabbit line pay
router.post("/topuprabbitlinepay", topup.topup_rabbitlinepay);

// ส่ง sms
router.post("/sendsms", topup.send_sms);

//ดึงข้อมูลออเดอร์  by reference_order
router.get("/getorder/:reference_order", topup.getorderbyreference_order);


module.exports = router
