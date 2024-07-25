const router = require("express").Router();
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
	const token = jwt.sign(
		{ row: 'Partner' },
		process.env.JWTPARTNERKEY
	);
	return res.status(200).send({ status: true, token: token });
})

module.exports = router;