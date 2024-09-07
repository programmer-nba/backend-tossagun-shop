const router = require("express").Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const sharp = require('sharp');
const Tesseract = require('tesseract.js');

const uploadFolder = path.join(__dirname, '../assets/slip');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadFolder)
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + file.originalname);
	},
});

router.post("/", async (req, res) => {
	try {
		let upload = multer({ storage: storage }).single("image_slip");
		upload(req, res, async function (err) {
			console.log(req.file)
			if (!req.file) {
				return res.status(405).send({ status: false, message: 'กรุณาแนบรูปภาพ' })
			} else {
				sharp(req.file.path)
					.grayscale()
					.toBuffer()
					.then((data) => {
						return Tesseract.recognize(data, 'tha+eng', {
							logger: (m) => console.log(m),
						});
					})
					.then(({ data: { text } }) => {
						console.log(text);
					})
					.catch((err) => {
						console.log(err)
					})
			}
		})
	} catch (error) {
		res.send({ mnessage: error.response.data.title });
	}
})

module.exports = router;