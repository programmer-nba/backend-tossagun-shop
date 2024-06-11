const Joi = require("joi");
const bcrypt = require("bcrypt");
const { Members, validate } = require("../../model/user/member.model");
const axios = require("axios");

//ส่ง OTP
exports.verify = async (req, res) => {
    try {
        const vali = (data) => {
            const schema = Joi.object({
                phone: Joi.string().required().label("ไม่พบเบอร์โทร"),
            });
            return schema.validate(data);
        };
        const { error } = vali(req.body);
        if (error) {
            return res
                .status(400)
                .send({ status: false, message: error.details[0].message });
        }
        const config = {
            method: "post",
            url: `${process.env.SMS_URL}/otp-send`,
            headers: {
                "Content-Type": "application/json",
                api_key: `${process.env.SMS_API_KEY}`,
                secret_key: `${process.env.SMS_SECRET_KEY}`,
            },
            data: JSON.stringify({
                project_key: `${process.env.SMS_PROJECT_OTP}`,
                phone: `${req.body.phone}`,
            }),
        };
        await axios(config)
            .then((result) => {
                if (result.data.code === "000") {
                    return res
                        .status(200)
                        .send({ status: true, result: result.data.result });
                } else {
                    return res.status(400).send({ status: false, ...result.data });
                }
            })
            .catch((err) => {
                console.log(err);
                return res.status(400).send(err);
            });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด" });
    }
};

//ตรวจสอบ OTP
exports.check = async (req, res) => {
    try {
        const vali = (data) => {
            const schema = Joi.object({
                otp_code: Joi.string().required().label("ไม่พบ otp_code"),
                token: Joi.string().required().label("ไม่พบ token"),
            });
            return schema.validate(data);
        };
        const { error } = vali(req.body);
        if (error) {
            return res
                .status(400)
                .send({ status: false, message: error.details[0].message });
        }
        const config = {
            method: "post",
            url: `${process.env.SMS_URL}/otp-validate`,
            headers: {
                "Content-Type": "application/json",
                api_key: `${process.env.SMS_API_KEY}`,
                secret_key: `${process.env.SMS_SECRET_KEY}`,
            },
            data: JSON.stringify({
                token: `${req.body.token}`,
                otp_code: `${req.body.otp_code}`,
            }),
        };
        await axios(config)
            .then(function (response) {
                console.log(response.data);
                //หมดอายุ
                if (response.data.code === "5000") {
                    return res.status(400).send({
                        status: false,
                        message: "OTP นี้หมดอายุแล้ว กรุณาทำรายการใหม่",
                    });
                }

                if (response.data.code === "000") {
                    //ตรวจสอบ OTP
                    if (response.data.result.status) {
                        return res
                            .status(200)
                            .send({ status: true, message: "ยืนยัน OTP สำเร็จ" });
                    } else {
                        return res.status(400).send({
                            status: false,
                            message: "รหัส OTP ไม่ถูกต้องกรุณาตรวจสอบอีกครั้ง",
                        });
                    }
                } else {
                    return res.status(400).send({ status: false, ...response.data });
                }
            })
            .catch(function (error) {
                console.log(error);
                return res.status(400).send({ status: false, ...error });
            });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด" });
    }
};

//ตรวจจสอบรหัสผู้เชิญชวน
exports.checkTel = async (req, res) => {
    try {
        const tel = req.params.tel;
        const member = await Members.findOne({ tel: tel });
        if (member) {
            return res.status(200).send({ status: true, message: "ดึงข้อมูลสมาชิกสำเร็จ", data: member, });
        } else {
            return res.status(403).send({ message: "ไม่พบข้อมูลสมาชิก", status: false });
        }
    } catch (error) {
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false, });
    }
};

exports.create = async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) {
            return res
                .status(400)
                .send({ message: error.details[0].message, status: false });
        }
        let tel = req.body.tel;
        tel = tel.replace("-", "");
        const member = await Members.findOne({ tel: tel });
        if (member) {
            return res
                .status(400)
                .send({ status: false, message: "เบอร์โทรศัพท์เป็นสมาชิกอยู่แล้ว" });
        }
        const card_number = `888${tel}`;
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        // let data;
        if (req.body.ref_tel) {
            const memberRef = await Members.findOne({
                tel: req.body.ref_tel,
            });
            if (memberRef) {
                const upline = {
                    lv1: memberRef._id,
                    lv2: memberRef.upline.lv1,
                    lv3: memberRef.upline.lv2,
                };
                const data = {
                    ...req.body,
                    tel: tel,
                    card_number: card_number,
                    password: hashPassword,
                    upline: upline,
                };
                const new_data = await Members.create(data);
                return res.status(200).send({
                    status: true,
                    message: "สมัครสมาชิกสำเร็จ",
                    data: new_data,
                });
            } else {
                return res.status(400).send({
                    status: false,
                    message: "ไม่พบข้อมูลผู้แนะนำเบอร์โทรที่แนะนำนี้",
                });
            }
        } else {
            const data = {
                ...req.body,
                tel: tel,
                card_number: card_number,
                password: hashPassword,
                // upline: upline,
            }
            const new_data = await Members.create(data);
            return res.status(200).send({
                status: true,
                message: "สมัครสมาชิกสำเร็จ",
                data: new_data,
            });
        }
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
};

exports.getMemberAll = async (req, res) => {
    try {
        const member = await Members.find();
        if (!member)
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลไม่สำเร็จ' })
        return res.status(200).send({ status: true, message: 'ดึงข้อมูลสมาชิกสำเร็จ', data: member })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, error: error.message });
    }
};

exports.getMemberById = async (req, res) => {
    try {
        const member = await Members.findById(req.params.id);
        if (!member)
            return res.status(403).send({ status: false, message: 'ดึงข้อมูลไม่สำเร็จ' })
        return res.status(200).send({ status: true, message: 'ดึงข้อมูลสมาชิกสำเร็จ', data: member })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        Members.findByIdAndUpdate(id, req.body, { useFindAndModify: false, }).then((data) => {
            if (!data) {
                return res.status(404).send({
                    message: `ไม่สารมารถแก้ไขข้อมูลสมาชิกได้!`,
                    status: false,
                });
            } else {
                console.log(data);
                return res.send({
                    message: "แก้ไขข้อมูลสมาชิกสำเร็จ",
                    status: true,
                });
            }
        }).catch((err) => {
            return res.status(500).send({
                message: "มีบ่างอย่างผิดพลาด",
                status: false,
            });
        });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, error: error.message });
    }
};

exports.getMemberTeam = async (req, res) => {
    try {
        const member = await Members.findOne({ tel: req.params.tel });
        if (!member) {
            return res
                .status(403)
                .send({ message: "เบอร์โทรนี้ยังไม่ได้เป็นสมาชิกของ NBA Platfrom" });
        } else {
            const upline = [member.upline.lv1, member.upline.lv2, member.upline.lv3];
            console.log("upline", upline);
            const validUplines = upline.filter((item) => item !== "-");
            const uplineData = [];
            let i = 0;
            for (const item of validUplines) {
                const include = await Members.findOne({ _id: item });
                console.log("include", include);
                if (include !== null) {
                    uplineData.push({
                        iden: include.iden.number,
                        name: include.name,
                        address: {
                            address: include.address,
                            subdistrict: include.subdistrict,
                            district: include.district,
                            province: include.province,
                            postcode: include.postcode,
                        },
                        tel: include.tel,
                        level: i + 1,
                    });
                    i++;
                }
            }
            const owner = {
                iden: member.iden.number,
                name: member.name,
                address: {
                    address: member.address,
                    subdistrict: member.subdistrict,
                    district: member.district,
                    province: member.province,
                    postcode: member.postcode,
                },
                tel: member.tel,
                level: "owner",
            };
            return res.status(200).send({
                message: "ดึงข้อมูลสำเร็จ",
                data: [
                    owner || null,
                    uplineData[0] || null,
                    uplineData[1] || null,
                    uplineData[2] || null,
                ],
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, error: error.message });
    }
};

module.exports.resetpassword = async (req, res) => {
    try {
        if (req.user.row === 'member') {
            const member = await Members.findOne({ _id: req.user._id });
            if (!member) {
                return res.status(403).send({ status: false, message: 'ไม่พบข้อมูลสมาชิก' });
            } else {
                const salt = await bcrypt.genSalt(Number(process.env.SALT));
                const hashPassword = await bcrypt.hash(req.body.password, salt);
                member.password = hashPassword;
                member.save();
                return res.status(200).send({ status: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
            }
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, error: error.message });
    }
};

module.exports.forgetpassword = async (req, res) => {
    try {
        const member = await Members.findOne({ tel: req.body.tel });
        if (!member) {
            return res.status(403).send({ status: false, message: 'ไม่พบข้อมูลสมาชิก' });
        } else {
            const salt = await bcrypt.genSalt(Number(process.env.SALT));
            const hashPassword = await bcrypt.hash(req.body.password, salt);
            member.password = hashPassword;
            member.save();
            return res.status(200).send({ status: true, message: 'รีเซ็ตรหัสผ่านสำเร็จ' });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, error: error.message });
    }
};