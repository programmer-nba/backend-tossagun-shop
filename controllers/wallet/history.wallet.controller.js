const { WalletHistory } = require("../../model/wallet/wallet.history.model");

exports.create = async (req, res) => {
    try {
        await new WalletHistory({
            ...req.body
        }).save();
        return res.status(201).send({ message: "สร้างรายงานใหม่เเล้ว", status: true });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const history = await WalletHistory.find();
        if (!history)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: history });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
};