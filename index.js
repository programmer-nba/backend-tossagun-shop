require("dotenv").config();

const cron = require('node-cron');
const axios = require('axios');

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./config/db");
connection();

app.use(bodyParser.json({ limit: "50mb", type: "application/json" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(cors());

const prefix = "/tossagun-shop";

// Login
app.use(prefix + "/login", require("./routes/login"));

// Register
app.use(prefix + "/register", require("./routes/register"));

// Me
app.use(prefix + "/me", require("./routes/me"));

// Admin
app.use(prefix + "/admin", require("./routes/user/admin"));

// Member (Platform)
app.use(prefix + "/member", require("./routes/user/member"));

// Customer
app.use(prefix + "/customer", require("./routes/user/customer"));
app.use(prefix + "/customer/me", require("./routes/user/customer.me"));
app.use(prefix + "/customer/login", require("./routes/customer.login"));

// Shop
app.use(prefix + "/partner/user", require("./routes/partner/partner"));
app.use(prefix + "/partner", require("./routes/partner/shop"));
app.use(prefix + "/partner/invest", require("./routes/partner/invest"));
app.use(prefix + "/shop", require("./routes/pos/shop"));
app.use(prefix + "/employee", require("./routes/user/employee"));

// Platform
app.use(prefix + "/platform", require("./routes/user/platform"));

// Contract สัญญา
app.use(prefix + "/contract", require("./routes/contract/index"));

// Product
app.use(prefix + "/product/tossagun", require("./routes/pos/product/product"));
// app.use(prefix + "/product/tossagun", require("./routes/pos/product/product.tossagun"));
app.use(prefix + "/product/shop", require("./routes/pos/product/product.shop"));
app.use(prefix + "/check", require("./routes/pos/check"));
app.use(prefix + "/percent-profit", require("./routes/pos/percent.profit"));

// Dealer
app.use(prefix + "/dealer", require("./routes/pos/dealer"));
app.use(prefix + "/brand", require("./routes/pos/brand"));

// Preorder
app.use(prefix + "/preorder/tossagun", require("./routes/pos/preorder/preorder.tossagun"));
app.use(prefix + "/preorder/shop", require("./routes/pos/preorder/preorder.shop"));
app.use(prefix + "/preorder/shop-full", require("./routes/pos/preorder/preorder.shop.full"));
// ปิดยอดการขายสินค้า
app.use(prefix + "/invoice/shop", require("./routes/pos/invoice.shop"));
app.use(prefix + "/percent/invest", require("./routes/pos/percent.invest"));
app.use(prefix + "/callback", require("./routes/pos/callback")); // ตัดยอดร้านทั้งหมดทีเดียว
app.use(prefix + "/invoice-tax", require("./routes/pos/preorder/invoice.tax"));

// Order Product
app.use(prefix + "/order/product", require("./routes/pos/order/order.product"));

// Image
app.use(prefix + "/delete/image", require("./routes/image/delete"));
app.use(prefix + "/collection/image", require("./routes/image/collection"));
// Delete Image
app.use(prefix + "/delete/image", require("./routes/deleteimage"));

// Tossagun Service
app.use(prefix + "/service/artwork", require("./routes/service/artwork")); // สื่อสิ่งพิมพ์
app.use(prefix + "/service/media", require("./routes/service/media")); // ส่งเสริมการตลาด
app.use(prefix + "/service/act", require("./routes/service/act")); // พ.ร.บ
app.use(prefix + "/service/tax", require("./routes/service/tax"));
app.use(prefix + "/service/program", require("./routes/service/program")); // ออกแบบเว็บไซต์ พัฒนาโปรแกรม
app.use(prefix + "/service/account", require("./routes/service/account")); // บัญชี

// AppPremium
app.use(prefix + "/service/topup", require("./routes/service/topup")); // ของแอพพรีเมี่ยม
app.use(prefix + "/service/apppremium", require("./routes/service/apppremium")); // ของแอพพรีเมี่ยม
app.use(prefix + "/service/game", require("./routes/service/game")); // ของแอพพรีเมี่ยม
app.use(prefix + "/service/cashcard", require("./routes/service/cashcard")); // ของแอพพรีเมี่ยม
app.use(prefix + "/apppremium/percent", require("./routes/apppremium/percent"));

// Order
app.use(prefix + "/order/service", require("./routes/service/order"));
app.use(prefix + "/commission", require("./routes/commission/commission"));

// Wallet
app.use(prefix + "/wallet", require("./routes/wallet/wallet"));
// Credit
app.use(prefix + "/credit", require("./routes/wallet/credit"));
app.use(prefix + "/check-slip", require("./routes/checkslip"));

// AOC สายการบิน
app.use(prefix + "/aoc", require("./routes/AOC/order.aoc"));
app.use(prefix + "/aoc/appendix", require("./routes/AOC/appendix"));
app.use(prefix + "/aoc/iata", require("./routes/AOC/IATA.route"));
app.use(prefix + "/aoc/airline/code", require("./routes/AOC/airline.code"));

// Shippop
app.use(prefix + "/express/customer", require("./routes/shippop/customer")); // ลูกค้า
app.use(prefix + "/express/insured", require("./routes/shippop/insured")); // ประกัน
app.use(prefix + "/express/name", require("./routes/shippop/name")); //ชื่อสินค้า
app.use(prefix + "/express/box", require("./routes/shippop/box")); //กล่องพัสดุ
app.use(prefix + "/express/shippop", require("./routes/shippop/shippop.order"));
app.use(prefix + "/express/booking", require("./routes/shippop/shippop.manage"));
app.use(prefix + "/express/shippop/percent", require("./routes/shippop/percent"));

// topup
// app.use(prefix + "/topup", require("./routes/topup/topup"));
app.use(prefix + "/topup/service", require("./routes/topup/topup.service"));
app.use(prefix + "/topup/percent", require("./routes/topup/percent"));

// Partner
app.use(prefix + "/e-market", require("./routes/ddscpartner/emarking"));
app.use(prefix + "/e-market/express", require("./routes/ddscpartner/express"));
app.use(prefix + "/store", require("./routes/ddscpartner/store"));

// Easybook
app.use(prefix + "/easybook", require("./routes/easybook/easybook.service.route"))

// API Product กลาง
app.use(prefix + "/api/api_product", require("./routes/api/api.product"));
app.use(prefix + "/api/api_express", require("./routes/api/api.express"));
app.use(prefix + "/api/api_service", require("./routes/api/api.service"));
app.use(prefix + "/api/api_topup", require("./routes/api/api.topup"));

// Backup ข้อมูล
app.use(prefix + "/backup", require("./routes/backup"));

// ฟังก์ชั่นเรียกใช้ API อัตโนมัติ
cron.schedule('0 */3 * * *', () => {
  console.log('Running a job every 3 hours');

  // Deverlop
  // axios.post("https:/api.tossaguns.online/tossagun-shop/express/booking/updatestatus").then((res) => {
  // console.log("API Response :", res.data.message);
  // }).catch((err) => {
  // console.error('Error calling API :', err.response.data.message);
  // })

  // Production
  axios.post("https:/api.tossaguns.com/tossagun-shop/express/booking/updatestatus").then((res) => {
    console.log("API Response : ", res.data);
  }).catch((err) => {
    console.error('Error calling API : ', err);
  })
});

cron.schedule('0 0 * * *', () => {
  // Deverlop
  // axios.post("https:/api.tossaguns.online/tossagun-shop/backup").then((res) => {
  // console.log("API Response :", res.data.message);
  // }).catch((err) => {
  // console.error('Error calling API :', err.response.data.message);
  // })

  // Production
  axios.post("https:/api.tossaguns.com/tossagun-shop/express/booking/updatestatus").then((res) => {
    console.log("API Response : ", res.data);
  }).catch((err) => {
    console.error('Error calling API : ', err);
  })
});

const port = process.env.PORT || 9999;

app.listen(port, () => {
  console.log(`Tossagun Shop API Runing PORT ${port}`);
});
