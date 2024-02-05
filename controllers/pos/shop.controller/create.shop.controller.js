const multer = require("multer");
const fs = require("fs");
const {Shops, validate} = require("../../../model/pos/shop.model");
const {google} = require("googleapis");

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});
const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-");
  },
});

exports.create = async (req, res) => {
  try {
    // const shop = await Shops.find();
    // const countValue = shop.length + 1;
    // const shop_number = `TOSSAGUN${countValue.toString().padStart(5, "0")}`;
    let upload = multer({storage: storage}).single("shop_logo", 20);
    upload(req, res, async function (err) {
      if (!req.file) {
        const {error} = validate(req.body);
        if (error)
          return res.status(401).send({message: error.details[0].message});
        await new Shops({
          ...req.body,
          // shop_number: shop_number,
        }).save();
        return res
          .status(200)
          .send({status: true, message: "สร้างช็อปใหม่เรียบร้อยแล้ว"});
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
        parents: [process.env.GOOGLE_DRIVE_IMAGE_SHOP],
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
        const {error} = validate(req.body);
        if (error)
          return res.status(400).send({message: error.details[0].message});
        const shop = await new Shops({
          ...req.body,
          shop_logo: response.data.id,
        }).save();
        res
          .status(201)
          .send({message: "สร้างร้านใหม่เเล้ว", status: true, shop: shop});
      } catch (error) {
        res.status(500).send({message: "Internal Server Error", status: false});
      }
    }
  } catch (error) {
    console.log(error.massage);
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
    // console.log(result.data);
  } catch (error) {
    console.log(error.message);
  }
}
