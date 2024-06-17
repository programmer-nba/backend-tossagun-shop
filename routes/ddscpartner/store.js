const router = require("express").Router();

const auth = require("../../lib/auth");
const store = require("../../controllers/ddscpartner/store.controller");

// ดึงข้อมูลร้านค้า เฉพาะที่เปิดอยู่
router.get("/getOpenStore", store.getOpenStore);

//ดึงข้อมูลร้านค้าทั้งหมด
router.get("/getAllStore", store.getAllStore);

//ดึงข้อมูลร้านค้า by id
router.get("/getStoreById/:id", store.getStoreById);

//ดึงข้อมูลสินค้า by shopid
router.get("/getProductByShopId/:id", store.getProductByShopId);

//ดึงข้อมูลสินค้า by id
router.get("/getProductById/:id", store.getProductById);


module.exports = router;