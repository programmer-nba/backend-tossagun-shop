const axios = require('axios');
// ดึงข้อมูลสินค้าที่ยังเปิดขายอยู่
exports.getOpenProduct = async (req, res) => {
    try{
        
        const apiResponse = await axios.get(`${process.env.PARTNER_URL}/product/getshopproduct`,
        {
            headers: {
                "Content-Type": "application/json",
                "token": `${process.env.PARTNER_TOKEN}`
            },
        })
        if(apiResponse.data?.status == true){
            return res.status(200).send({status:true, message:apiResponse.data.data})
        }else{
            return res.status(400).send({status:false, message:"ดึงข้อมูลสินค้าไม่สำเร็จ"})
        }
    }catch(error){ 
        return res.status(500).send({message: error.message,status:false});
    }
}


