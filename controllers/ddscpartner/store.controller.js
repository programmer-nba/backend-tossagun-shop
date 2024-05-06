const axios = require('axios');

// ดึงข้อมูลร้านค้า เฉพาะที่เปิดอยู่
exports.getOpenStore = async (req, res) => {
    try{

        const apiResponse = await axios.get(`${process.env.PARTNER_URL}/shop/getshop/`,
        {
            headers: {
                "Content-Type": "application/json",
                "token": `${process.env.PARTNER_TOKEN}`
            },
        });
        if(apiResponse.data.status == true){
            return res.status(200).send({status:true, message:apiResponse.data.data})
        }else{
            return res.status(400).send({status:false, message:"ดึงข้อมูลสินค้าไม่สำเร็จ"})
        }
    }catch(error){ 
        return res.status(500).send({message: 'Internal server error',status:false,error:error.message});
    }
}

//ดึงข้อมูลร้านค้าทั้งหมด
exports.getAllStore = async (req, res) => {
    try{

        const apiResponse = await axios.get(`${process.env.PARTNER_URL}/shop/getshop/getall/`,
        {
            headers: {
                "Content-Type": "application/json",
                "token": `${process.env.PARTNER_TOKEN}`
            },
        });
        if(apiResponse.data.status == true){
            return res.status(200).send({status:true, message:apiResponse.data.data})
        }else{
            return res.status(400).send({status:false, message:"ดึงข้อมูลสินค้าไม่สำเร็จ"})
        }
    }catch(error){ 
        return res.status(500).send({message: 'Internal server error',status:false,error:error.message});
    }
}


//ดึงข้อมูลร้านค้า by id
exports.getStoreById = async (req, res) => { 
    try{
        const apiResponse = await axios.get(`${process.env.PARTNER_URL}/shop/getshop/byid/${req.params.id}`,
        {
            headers: {
                "Content-Type": "application/json",
                "token": `${process.env.PARTNER_TOKEN}`
            },
        });
        if(apiResponse.data.status == true){
            return res.status(200).send({status:true, message:apiResponse.data.data})
        }else{
            return res.status(400).send({status:false, message:"ดึงข้อมูลสินค้าไม่สำเร็จ"})
        }
    }catch(error){ 
        return res.status(500).send({message: 'Internal server error',status:false,error:error.message});
    }
}

//สินค้า

//ดึงข้อมูลสินค้า by shop id
exports.getProductByShopId = async (req, res) => {
    try{
        const apiResponse = await axios.get(`${process.env.PARTNER_URL}/productshop/tossagunshop/productbyshopid/${req.params.id}`,
        {
            headers: {
                "Content-Type": "application/json",
                "token": `${process.env.PARTNER_TOKEN}`
            },
        });
        if(apiResponse.data.status == true){
            return res.status(200).send({status:true, message:apiResponse.data.data})
        }else{
            return res.status(400).send({status:false, message:"ดึงข้อมูลสินค้าไม่สำเร็จ"})
        }
    }catch(error){ 
        return res.status(500).send({message: 'Internal server error',status:false,error:error.message});
    }
}

//ดึงข้อมูลสินค้า by id
exports.getProductById = async (req, res) => {
    try{
        const apiResponse = await axios.get(`${process.env.PARTNER_URL}/productshop/tossagunshop/productbyid/${req.params.id}`,
        {
            headers: {
                "Content-Type": "application/json",
                "token": `${process.env.PARTNER_TOKEN}`
            },
        });
        if(apiResponse.data.status == true){
            return res.status(200).send({status:true, message:apiResponse.data.data})
        }else{
            return res.status(400).send({status:false, message:"ดึงข้อมูลสินค้าไม่สำเร็จ"})
        }
    }catch(error){ 
        return res.status(500).send({message: 'Internal server error',status:false,error:error.message});
    }
}