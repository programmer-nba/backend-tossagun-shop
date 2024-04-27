const { TopupWallet } = require("../../model/wallet/topup.wallet.model");

exports.getWalletAll = async (req, res) => {
    try {
        const wallet = await TopupWallet.find();
        if (wallet)
            return res.status(200).send({ staus: true, message: 'ดึงข้อมูลสำเร็จ', data: wallet })
        return res.status(403).send({ staus: false, message: 'ดึงข้อมูลไม่สำเร็จ' })
    } catch {
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", error: "server side error" });
    }
}