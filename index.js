require("dotenv").config();

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
// Landlord
app.use(prefix + "/landlord", require("./routes/user/landlord"));
app.use(prefix + "/landlord/invesment", require("./routes/landlord/shop"));
// Invertor
app.use(prefix + "/investor", require("./routes/user/invertor"));
app.use(prefix + "/investor/invesment", require("./routes/invesment/slip"));
// Outlay
app.use(prefix + "/outlay", require("./routes/user/ouylay"));
// Shop
app.use(prefix + "/shop", require("./routes/pos/shop"));
app.use(prefix + "/employee", require("./routes/user/employee"));
// Platform
app.use(prefix + "/platform", require("./routes/user/platform"));
// Contract สัญญา
app.use(prefix + "/contract", require("./routes/contract/index"));
// Product
app.use(prefix + "/product", require("./routes/pos/product/product"));
app.use(
  prefix + "/product/tossagun",
  require("./routes/pos/product/product.tossagun")
);
app.use(prefix + "/product/shop", require("./routes/pos/product/product.shop"));
app.use(prefix + "/check", require("./routes/pos/check"));
app.use(prefix + "/percent-profit", require("./routes/pos/percent.profit"));
// Dealer
app.use(prefix + "/dealer", require("./routes/pos/dealer"));
app.use(prefix + "/brand", require("./routes/pos/brand"));
// Image
app.use(prefix + "/delete/image", require("./routes/image/delete"));
app.use(prefix + "/collection/image", require("./routes/image/collection"));
// Preorder
app.use(
  prefix + "/preorder/tossagun",
  require("./routes/pos/preorder/preorder.tossagun")
);
app.use(
  prefix + "/preorder/shop",
  require("./routes/pos/preorder/preorder.shop")
);
app.use(
  prefix + "/preorder/shop-full",
  require("./routes/pos/preorder/preorder.shop.full")
);
app.use(prefix + "/invoice-tax", require("./routes/pos/preorder/invoice.tax"));
// Order Product
app.use(prefix + "/order", require("./routes/pos/order/order.product"));
app.use(prefix + "/callback", require("./routes/pos/callback"));

// Delete Image
app.use(prefix + "/delete/image", require("./routes/deleteimage"));
// Tossagun Service
app.use(prefix + "/service/artwork", require("./routes/service/artwork"));

// express ระบบขนส่ง
app.use(prefix + "/express/product", require("./routes/express/product.express"));

const port = process.env.PORT || 9999;

app.listen(port, () => {
  console.log(`Tossagun Shop API Runing PORT ${port}`);
});
