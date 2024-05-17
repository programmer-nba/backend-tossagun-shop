const { Commission } = require("../../model/pos/commission/commission.model");

module.exports.getCommissionByTel = async (req, res) => {
    try {
        let tel;
        if (req.user.row === 'member') {
            tel = req.user.tel;
        } else if (req.user.row === 'employee') {
            tel = req.user.phone.replace(/-/g, "");
        }
        const pipeline = [
            {
                $unwind: "$data",
            },
            {
                $match: { "data.tel": tel },
            }
        ];
        const data = await Commission.aggregate(pipeline);
        if (data) {
            return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: data });
        } else {
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "เกิดข้อผิดพลาดบางอย่าง", data: error.data });
    }
};