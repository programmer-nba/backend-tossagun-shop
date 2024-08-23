const router = require("express").Router();

router.post("/", async (req, res) => {
	try {
		const booking = await shippopBooking.find();
		for (let i = 0; i < booking.length; i++) {
			const value = {
				tracking_code: booking[i].tracking_code,
			};
			const resp = await axios.post(`${process.env.SHIPPOP_URL}/tracking/`, value, {
				headers: { "Accept-Encoding": "gzip,deflate,compress" },
			});
			booking[i].order_status = resp.data.order_status;
			booking[i].save();
		};
		console.log("อัพเดตข้อมูลสำเร็จ")
		// return res.status(200).send({ status: true, message: 'อัพเดตข้อมูลสำเร็จ' })
	} catch (error) {
		console.log(err);
		return res.status(500).send({ message: "มีบางอย่างผิดพลาด" });
	}
});

module.exports = router;