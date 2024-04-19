const { Shops } = require("../../../model/pos/shop.model")
const multer = require("multer");
const fs = require("fs");
const { google } = require("googleapis");
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
        // console.log(file.originalname);
    },
});

// Create category
module.exports.create = async (req, res) => {
    try {
        let upload = multer({ storage: storage }).single("shop_logo");
        upload(req, res, async function (err) {
            if (!req.file) {
                await new Shops({
                    ...req.body,
                }).save();
                return res.status(201).send({ message: "สร้างร้านค้าสำเร็จ", status: true });
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
                parents: [process.env.GOOELE_DRIVE_ARTWORK_CATEGORY],
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
                await new Shops({
                    ...req.body,
                    image: response.data.id,
                }).save();
                return res.status(201).send({ message: "สร้างร้านค้าสำเร็จ", status: true });
            } catch (error) {
                return res.status(500).send({ message: "Internal Server Error", status: false });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

async function generatePublicUrl(res) {
    try {
        const fileId = res;
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: "reader",
                type: "anyone",
            },
        });
        const result = await drive.files.get({
            fileId: fileId,
            fields: "webViewLink, webContentLink",
        });
        console.log(result.data);
    } catch (error) {
        console.log(error.message);
    }
}
