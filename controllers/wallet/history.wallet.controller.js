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
        const pipelint = [
            {
                $match: { category: 'Wallet' },
            },
            {
                $group: { _id: 0, count: { $sum: 1 } },
            },
        ];
        const history = await WalletHistory.aggregate(pipelint);
        if (!history)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: history });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
};

exports.getByMakerId = async (req, res) => {
    try {
        const id = req.params.makerid;
        const pipelint = [
            {
                $match: { category: 'Wallet', maker_id: id },
            },
            {
                $group: { _id: 0, count: { $sum: 1 } },
            },
        ];
        const history = await WalletHistory.aggregate(pipelint);
        if (!history)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: history });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
};

exports.getByShopId = async (req, res) => {
    try {
        const id = req.params.shopid;
        const pipelint = [
            {
                $match: { category: 'Wallet', shop_id: id },
            },
            {
                $group: { _id: 0, count: { $sum: 1 } },
            },
        ];
        const history = await WalletHistory.aggregate(pipelint);
        if (!history)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: history });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
};