const bcrypt = require("bcrypt");
const { Invertors, validate } = require("../../model/user/investor.model");

exports.create = async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error)
            return res
                .status(400)
                .send({ message: error.details[0].message, status: false });

        const invertor = await Invertors.findOne({
            invertor_iden: req.body.invertor_iden,
        });
        if (invertor)
            return res.status(409).send({
                status: false,
                message: "มีชื่อผู้ใช้งานนี้ในระบบเเล้ว",
            });
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.invertor_password, salt);

        await new Invertors({
            ...req.body,
            invertor_password: hashPassword,
        }).save();
        return res.status(201).send({ message: "สร้างข้อมูลสำเร็จ", status: true });
    } catch (error) {
        res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
};

exports.findAll = async (req, res) => {
    try {
        Invertors.find()
            .then(async (data) => {
                res.send({ data, message: "success", status: true });
            })
            .catch((err) => {
                res.status(500).send({
                    message: err.message || "มีบางอย่างผิดพลาด",
                });
            });
    } catch (error) {
        res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
};
exports.findOne = async (req, res) => {
    const id = req.params.id;
    try {
        Invertors.findById(id)
            .then((data) => {
                if (!data)
                    res
                        .status(404)
                        .send({ message: "ไม่สามารถหาผู้ใช้งานนี้ได้", status: false });
                else res.send({ data, status: true });
            })
            .catch((err) => {
                res.status(500).send({
                    message: "มีบางอย่างผิดพลาด",
                    status: false,
                });
            });
    } catch (error) {
        res.status(500).send({
            message: "มีบางอย่างผิดพลาด",
            status: false,
        });
    }
};
exports.update = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).send({
                message: "ส่งข้อมูลผิดพลาด",
            });
        }
        const id = req.params.id;
        if (!req.body.invertor_password) {
            Invertors.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
                .then((data) => {
                    if (!data) {
                        res.status(404).send({
                            message: `ไม่สามารถเเก้ไขผู้ใช้งานนี้ได้`,
                            status: false,
                        });
                    } else
                        res.send({
                            message: "แก้ไขผู้ใช้งานนี้เรียบร้อยเเล้ว",
                            status: true,
                        });
                })
                .catch((err) => {
                    res.status(500).send({
                        message: "มีบ่างอย่างผิดพลาด" + id,
                        status: false,
                    });
                });
        } else {
            const salt = await bcrypt.genSalt(Number(process.env.SALT));
            const hashPassword = await bcrypt.hash(req.body.invertor_password, salt);
            Invertors.findByIdAndUpdate(
                id,
                { ...req.body, invertor_password: hashPassword },
                { useFindAndModify: false }
            )
                .then((data) => {
                    if (!data) {
                        res.status(404).send({
                            message: `ไม่สามารถเเก้ไขผู้ใช้งานนี้ได้`,
                            status: false,
                        });
                    } else
                        res.send({
                            message: "แก้ไขผู้ใช้งานนี้เรียบร้อยเเล้ว",
                            status: true,
                        });
                })
                .catch((err) => {
                    res.status(500).send({
                        message: "ไม่สามารถเเก้ไขผู้ใช้งานนี้ได้",
                        status: false,
                    });
                });
        }
    } catch (error) {
        res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
};
exports.delete = async (req, res) => {
    const id = req.params.id;
    try {
        Invertors.findByIdAndDelete(id, { useFindAndModify: false })
            .then((data) => {
                if (!data) {
                    res.status(404).send({
                        message: `ไม่สามารถลบผู้ใช้งานนี้ได้`,
                        status: false,
                    });
                } else {
                    res.send({
                        message: "ลบผู้ใช้งานนี้เรียบร้อยเเล้ว",
                        status: true,
                    });
                }
            })
            .catch((err) => {
                res.status(500).send({
                    message: "ไม่สามารถลบผู้ใช้งานนี้ได้",
                    status: false,
                });
            });
    } catch (error) {
        res.status(500).send({
            message: "ไม่สามารถลบผู้ใช้งานนี้ได้",
            status: false,
        });
    }
};
