require("dotenv").config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./config/db");
connection();

app.use(bodyParser.json({limit: "50mb", type: "application/json"}));
app.use(bodyParser.urlencoded({extended: true}));

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
// Invertor
app.use(prefix + "/investor", require("./routes/user/invertor"));
app.use(prefix + "/investor/investment", require("./routes/invesment/slip"));
// Shop
app.use(prefix + "/shop", require("./routes/pos/shop"));
app.use(prefix + "/employee", require("./routes/user/employee"));
// Platform
app.use(prefix + "/platform", require("./routes/user/platform"));
// Product
app.use(prefix + "/product", require("./routes/pos/product"));
app.use(prefix + "/check", require("./routes/pos/check"));
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

const port = process.env.PORT || 9999;

app.listen(port, () => {
  console.log(`Tossagun Shop API Runing PORT ${port}`);
});
