const { default: axios } = require("axios");
const { shippopBooking } = require("../../model/shippop/shippop.order");
const { string } = require("joi");

module.exports.update = async (req, res) => {
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

module.exports.delend = async (req, res) => {
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

module.exports.getAll = async (req, res) => {
    try {
        const booking = await shippopBooking.find();
        // let order = [];
        // for (let i = 0; i < booking.length; i++) {
        // if (booking[i].order_status !== 'cancel') {
        // const value = {
        // tracking_code: booking[i].tracking_code,
        // };
        // const resp = await axios.post(`${process.env.SHIPPOP_URL}/tracking/`, value, {
        // headers: { "Accept-Encoding": "gzip,deflate,compress" },
        // });
        // booking[i].order_status = resp.data.order_status;
        // booking[i].save();
        // }

        // console.log('อัพเดทสถานะสำเร็จ')
        // if (booking[i].order_status === 'cancel') {
        // console.log('ออเดอร์นี้ถูกยกเลิก')
        // } else if (booking[i].order_status === 'complete') {
        // console.log('ออเดอร์นี้จัดส่งสำเร็จ')
        // } else {
        // const id = string(booking[i]._id);
        // console.log(id);
        // const value = {
        // tracking_code: booking[i].tracking_code,
        // };
        // const resp = await axios.post(`${process.env.SHIPPOP_URL}/tracking/`, value, {
        // headers: { "Accept-Encoding": "gzip,deflate,compress" },
        // });
        // booking[i].order_status = resp.data.order_status;
        // shippopBooking.findByIdAndUpdate(booking[i]._id, { order_status: resp.data.order_status }, { useFindAndModify: false });
        // booking[i].save();
        // }
        // order.push(booking[i]);
        // }

        // console.log(order)
        // return res.status(200).send({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: order })

        if (booking) {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลสำเร็จ', data: booking })
        } else {
            return res.status(400).send({ status: false, message: 'มีบางอย่างผิดพลาด' })
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err })
    }
}

module.exports.getById = async (req, res) => {
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

module.exports.updateCourierTrackingCode = async (req, res) => {
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

module.exports.updateStatus = async (req, res) => {
    try {
        const booking = await shippopBooking.find();
        for (let i = 0; i < booking.length; i++) {
            const value = {
                tracking_code: booking[i].tracking_code,
            };
            const resp = await axios.post(`${process.env.SHIPPOP_URL}/tracking/`, value, {
                headers: { "Accept-Encoding": "gzip,deflate,compress" },
            });
            booking[i].order_status = resp.data.order_status;
            booking[i].save();
        };
        return res.status(200).send({ status: true, message: 'อัพเดตข้อมูลสำเร็จ' })
    } catch (error) {
        console.log(err);
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด" });
    }
}

module.exports.callToPickup = async (req, res) => {
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

// module.exports = { update, delend, getAll, getById, callToPickup, updateCourierTrackingCode }