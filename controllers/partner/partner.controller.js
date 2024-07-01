const axios = require("axios");

module.exports.getPartnerAll = async (req, res) => {
	try {
		const resp = await axios.get(`${process.env.PARTNER_URL}/partner`);
		if (!resp.data.status)
			return res.status(400).send({ status: false, message: resp.data.message });
		return res.status(200).send({ status: true, message: 'ดึงข้อมูลพาร์ทเนอร์สำเร็จ', data: resp.data.data })
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};

module.exports.getPartnerById = async (req, res) => {
	try {
		const id = req.params.id;
		const resp = await axios.get(`${process.env.PARTNER_URL}/partner/byid/${id}`);
		if (!resp.data.status)
			return res.status(400).send({ status: false, message: resp.data.message });
		return res.status(200).send({ status: true, message: 'ดึงข้อมูลพาร์ทเนอร์สำเร็จ', data: resp.data.data })
	} catch (error) {
		console.error(error);
		return res.status(500).send({ message: "Internal Server Error" });
	}
};