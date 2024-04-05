const { WalletSlips, validate } = require("../../model/wallet/wallet.slip.model");
const multer = require("multer");
const fs = require("fs");
const { google } = require("googleapis");
const dayjs = require("dayjs");
const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
});
const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

exports.create = async (req, res) => {
    try {
        let upload = multer({ storage: storage }).single("slip_image");
        upload(req, res, async function (err) {
            if (!req.file) {
                // const { error } = validate(req.body);
                // if (error)
                    // return res.status(400).send({ message: error.details[0].message });
                const status = {
                    name: 'รอตรวจสอบ',
                    timestamp: dayjs(Date.now()),
                };
                await new WalletSlips({
                    ...req.body,
                    partner_id: req.decoded._id,
                    status: status,
                }).save();
                return res.status(201).send({ message: "สร้างรายงานใหม่เเล้ว", status: true });
            } else if (err instanceof multer.MulterError) {
                return res.send(err);
            } else if (err) {
                return res.send(err);
            } else {
                uploadFileCreate(req, res);
            }
        });

        async function uploadFileCreate(req, res) {
            const filePath = req.file.path;
            let fileMetaData = {
                name: req.file.originalname,
                parents: [process.env.GOOELE_DRIVE_SLIP],
            };
            let media = {
                body: fs.createReadStream(filePath),
            };
            try {
                const response = await drive.files.create({
                    resource: fileMetaData,
                    media: media,
                });
                generatePublicUrl(response.data.id);
                // const { error } = validate(req.body);
                // if (error)
                    // return res.status(400).send({ message: error.details[0].message });
                const status = {
                    name: 'รอตรวจสอบ',
                    timestamp: dayjs(Date.now()),
                };
                await new WalletSlips({
                    ...req.body,
                    partner_id: req.decoded._id,
                    detail: response.data.id,
                    status: status,
                }).save();
                return res.status(201).send({ message: "สร้างรายงานใหม่เเล้ว", status: true });
            } catch (error) {
                return res.status(500).send({ message: "Internal Server Error", status: false });
            }
        }
    } catch (err) {
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
}