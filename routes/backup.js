const router = require("express").Router();
const mongoose = require('mongoose');
const fs = require('fs');

router.post("/", async (req, res) => {
	try {

		const db = mongoose.connection.db;
		const collections = await db.listCollections().toArray();

		let backupData = {};

		for (let collection of collections) {
			const collectionName = collection.name;
			const data = await db.collection(collectionName).find({}).toArray();
			backupData[collectionName] = data;
		}

		const backupJSON = JSON.stringify(backupData, null, 2);
		fs.writeFileSync('backup.json', backupJSON);

		return res.status(200).send({ status: true, message: 'Backup Completed' });
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: "Internal Server Error" });
	}
})

module.exports = router;