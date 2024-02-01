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
// Me
app.use(prefix + "/me", require("./routes/me"));
// Admin
app.use(prefix + "/admin", require("./routes/user/admin"));
// Landlord
app.use(prefix + "/landlord", require("./routes/user/landlord"));
// Invertor
app.use(prefix + "/invertor", require("./routes/user/invertor"));
// Shop
app.use(prefix + "/shop", require("./routes/"))

const port = process.env.PORT || 9999;

app.listen(port, () => {
  console.log(`Tossagun Shop API Runing PORT ${port}`);
});
