const router = require("express").Router();
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
	try {
		const token = jwt.sign(
			{ row: 'Partner' },
			process.env.JWTPARTNERKEY
		);
		return res.status(201).send({ status: true, token: token });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "Internal Server Error" });
	}
});

module.exports = router;