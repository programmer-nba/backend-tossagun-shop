const axios = require("axios");

async function OrderOfficeCreate(packageData) {
	let data = JSON.stringify(packageData);
	const config = {
		method: 'POST',
		headers: {
			"Content-Type": "application/json"
		},
		url: `${process.env.OFFICE_URL}/project/shop`,
		data: data,
	};
	await axios(config).then((res) => {
		console.log(res.data.message);
	}).catch((err) => {
		console.log(err.response.data);
	})
}

async function OrderOfficeCancel(packageData) {
	let data = JSON.stringify(packageData);
	const config = {
		method: 'PUT',
		headers: {
			"Content-Type": "application/json"
		},
		url: `${process.env.OFFICE_URL}/project/shop/cancel`,
		data: data,
	};
	await axios(config).then((res) => {
		console.log(res.data.message);
	}).catch((err) => {
		console.log(err.response.data);
	})
}

module.exports = { OrderOfficeCreate, OrderOfficeCancel };