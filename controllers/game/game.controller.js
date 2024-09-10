const axios = require("axios");

module.exports.getProductAll = async (req, res) => {
	try {
		let config = {
			method: 'get',
			maxBodyLength: Infinity,
			url: `${process.env.APPPREMIUM_URL}game`,
			headers: {
				'Cookie': 'PHPSESSID=92h3fpmr45vidrb1albn4e8uhr'
			}
		};
		await axios.request(config).then((response) => {
			// console.log(JSON.stringify(response.data));
			// console.log(response.data)
			return res.status(200).send({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: response.data });
		}).catch((error) => {
			console.log(error);
		});
	} catch (error) {
		console.log(error);
		return res.status(500).send({ message: "เกิดข้อผิดพลาดบางอย่าง", data: error.data });
	}
};
