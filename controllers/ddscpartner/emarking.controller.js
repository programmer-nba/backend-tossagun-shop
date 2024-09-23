const axios = require('axios');
// ดึงข้อมูลสินค้าที่ยังเปิดขายอยู่
exports.getOpenProduct = async (req, res) => {
    try {
        const resp = await axios.get(`${process.env.PARTNER_URL}/product/getshopproduct`, {
            headers: {
                "Content-Type": "application/json",
                "token": `${process.env.PARTNER_TOKEN}`
            },
        });
        const product = resp.data.data;
        const products = product.filter(
            (el) => el.product_status === true
        );
        if (resp.data.status == true) {
            return res.status(200).send({ status: true, message: 'ดึงข้อมูลสินค้าสำเร็จ', data: products })
        } else {
            return res.status(400).send({ status: false, message: "ดึงข้อมูลสินค้าไม่สำเร็จ" })
        }
    } catch (error) {
        return res.status(500).send({ message: error.message, status: false });
    }
}


