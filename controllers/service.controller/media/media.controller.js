const { ProductMedias, validate } = require("../../../model/service/media/media.model")
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

// Create Media
module.exports.create = async (req, res) => {
    try {
        let upload = multer({ storage: storage }).single("image");
        upload(req, res, async function (err) {
            if (!req.file) {
                const { error } = validate(req.body);
                if (error) {
                    return res
                        .status(400)
                        .send({ message: error.details[0].message, status: false });
                }
                await new ProductMedias({
                    ...req.body,
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
                parents: [process.env.GOOELE_DRIVE_MEDIA_PRODUCT],
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
                await new ProductMedias({
                    ...req.body,
                    image: response.data.id,
                }).save();
                return res.status(201).send({ message: "สร้างรายงานใหม่เเล้ว", status: true });
            } catch (error) {
                return res.status(500).send({ message: "Internal Server Error", status: false });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

// Get All Media
module.exports.getMediaAll = async (req, res) => {
    try {
        const media = await ProductMedias.find();
        if (!media)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: media });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};

// Get Media by id
module.exports.getMediaById = async (req, res) => {
    try {
        const media = await ProductMedias.findById(req.params.id);
        if (!media)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: media });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
};


// Delete Media
module.exports.deleteMedia = async (req, res) => {
    try {
        const id = req.params.id;
        ProductMedias.findByIdAndDelete(id, { useFindAndModify: false }).then((data) => {
            if (!data) {
                return res.status(404).send({ message: `ไม่สามารถลบรายงานนี้ได้`, status: false, });
            } else {
                return res.send({ message: "ลบรายงานนี้เรียบร้อยเเล้ว", status: true, });
            }
        }).catch((err) => {
            return res.status(500).send({ message: "ไม่สามารถลบรายงานนี้ได้", status: false, });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

// Update Media
module.exports.updateMedia = async (req, res) => {
    try {
        let upload = multer({ storage: storage }).single("image");
        upload(req, res, async function (err) {
            console.log(req.file);
            if (!req.file) {
                const id = req.params.id;
                ProductMedias.findByIdAndUpdate(id, req.body, { useFindAndModify: false, }).then((data) => {
                    if (!data) {
                        res.status(404).send({
                            message: `ไม่สามารถเเก้ไขรายงานนี้ได้`,
                            status: false,
                        });
                    } else
                        res.send({
                            message: "แก้ไขรายงานนี้เรียบร้อยเเล้ว",
                            status: true,
                        });
                }).catch((err) => {
                    res.status(500).send({
                        message: "มีบ่างอย่างผิดพลาด",
                        status: false,
                    });
                });
            } else if (err instanceof multer.MulterError) {
                return res.send(err);
            } else if (err) {
                return res.send(err);
            } else {
                uploadFile(req, res);
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

async function uploadFile(req, res) {
    const filePath = req.file.path;
    let fileMetaData = {
        name: req.file.originalname,
        parents: [process.env.GOOELE_DRIVE_MEDIA_PRODUCT],
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
        const id = req.params.id;
        ProductMedias.findByIdAndUpdate(id, { ...req.body, image: response.data.id }, { useFindAndModify: false }).then((data) => {
            if (!data) {
                res.status(404).send({
                    status: false,
                    message: `Cannot update Advert with id=${id}. Maybe Advert was not found!`,
                });
            } else
                res.status(201).send({
                    message: "แก้ไขรายงานสำเร็จ.",
                    status: true,
                });
        }).catch((err) => {
            res.status(500).send({
                message: "Error updating Advert with id=" + id,
                status: false,
            });
        });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
}

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