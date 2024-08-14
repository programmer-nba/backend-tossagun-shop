const router = require("express").Router();
const artwork = require("../../controllers/customer/service/api.artwork.controller");
const authPartner = require("../../lib/auth.partner");

// Image
router.get("/image/:imagename", artwork.getProductImage);

router.post("/artwork", authPartner, artwork.getProductArtwork);

module.exports = router;