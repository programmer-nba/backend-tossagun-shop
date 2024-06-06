const { PercentTopup } = require("../../model/topup/topup.percent");

module.exports.booking = async (req, res) => {
    try {
        const percent = await PercentTopup.find();
        console.log(percent)
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "เกิดข้อผิดพลาดบางอย่าง", data: error.data });
    }
}