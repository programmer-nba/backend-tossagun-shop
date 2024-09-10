const router = require("express").Router();
const game = require("../../controllers/game/game.controller");
const auth = require("../../lib/auth");

router.post("/", game.getProductAll);

module.exports = router;