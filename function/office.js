const axios = require("axios");

async function OrderOfficeCreate(packageData) {
	let data = JSON.stringify(packageData);
	const config = {
		method: 'post',
		headers: {
			"Content-Type": "application/json"
		},
		url: `${process.env.OFFICE_URL}/project/insert`,
		data: data,
	};
	await axios(config).then((res) => {
		console.log(res.data.message);
	}).catch((err) => {
		console.log(err.response.data);
	})
}

module.exports = { OrderOfficeCreate };