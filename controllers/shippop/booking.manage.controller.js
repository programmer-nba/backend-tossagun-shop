const { default: axios } = require("axios");
const { shippopBooking } = require("../../model/shippop/shippop.order");

update = async (req, res) => {
    try {
        const id = req.params.id
        const formData = req.body
        const findOrder = await shippopBooking.findByIdAndUpdate(
            id,
            {
                ...formData
            },
            { new: true })
        if (!findOrder) {
            return res
                .status(404)
                .send({ status: false, message: "ไม่สามารถค้นหาออเดอร์ที่ท่านต้องการได้" })
        }
        return res
            .status(200)
            .send({ status: false, data: findOrder })
    } catch (err) {
        return res
            .status(500)
            .send({ status: false, message: err })
    }
}

delend = async (req, res) => {
    try {
        const id = req.params.id
        const del = await shippopBooking.findByIdAndDelete(id)
        if (!del) {
            return res
                .status(404)
                .send({ status: false, message: "ไม่สามารถค้นหาหมายเลขออเดอร์ที่ต้องการลบได้" })
        }
        return res
            .status(200)
            .send({ status: true, data: del })
    } catch (err) {
        return res
            .status(500)
            .send({ status: false, message: err })
    }
}

getAll = async (req, res) => {
    try {
        const find = await shippopBooking.find()
        if (find.length == 0) {
            return res
                .status(200)
                .send({ status: true, data: [] })
        }
        return res
            .status(200)
            .send({ status: true, data: find })
    } catch (err) {
        return res
            .status(500)
            .send({ status: false, message: err })
    }
}

getById = async (req, res) => {
    try {
        const id = req.params.id
        const findId = await shippopBooking.findById(id)
        if (!findId) {
            return res
                .status(404)
                .send({ status: false, message: "ไม่พบออเดอร์ที่ท่านต้องการหา" })
        }
        return res
            .status(200)
            .send({ status: false, data: findId })
    } catch (err) {
        return res
            .status(500)
            .send({ status: false, message: err })
    }
}

updateCourierTrackingCode = async (req, res) => {
    try {
        if (req.body.tracking_code === undefined) {
            return res.status(400).send({ message: "ไม่พบ traking_code" });
        }
        const parcel = await shippopBooking.findOne({
            tracking_code: req.body.tracking_code,
        });
        if (parcel) {
            const shippop = await axios.post(`${process.env.SHIPPOP_URL}/tracking/`, {
                tracking_code: req.body.tracking_code,
            });
            if (shippop) {
                if (shippop.data.status) {
                    const update = await shippopBooking.findByIdAndUpdate(parcel._id, {
                        courier_tracking_code: shippop.data.courier_tracking_code,
                    });
                    if (update) {
                        const new_data = await shippopBooking.findById(parcel._id);
                        return res.status(200).send({ status: true, data: new_data });
                    } else {
                        return res
                            .status(400)
                            .send({ message: "อัพเดต Courier Tracking Code ไม่สำเร็จ" });
                    }
                } else {
                    return res.status(400).send({ message: "ไม่พบ tracking code" });
                }
            } else {
                return res.status(400).send({ message: "ตรวจสอบข้อมูลไม่สำเร็จ" });
            }
        }
    } catch (error) {
        console.log(err);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด" });
    }
}

callToPickup = async (req, res) => {
    try {
        if (req.body.courier_tracking_code === undefined) {
            return res.status(400).send({ message: "ไม่พบเลขติดตามพัสดุ" });
        }
        const shippop = await axios.post(`${process.env.SHIPPOP_URL}/calltopickup/`, {
            api_key: process.env.SHIPPOP_API_KEY,
            tracking_code: String(req.body.courier_tracking_code),
        });
        if (shippop.data.status) {
            return res.status(200).json(shippop.data);
        } else {
            return res.status(400).json(shippop.data);
        }
    } catch (error) {
        console.log(err);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด" });
    }
}

module.exports = { update, delend, getAll, getById, callToPickup, updateCourierTrackingCode }