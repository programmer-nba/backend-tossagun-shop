
const jwt = require('jsonwebtoken');   
const axios = require('axios');

//สร้าง token สำหรับใช้ยิง api ของ topup
const gentoken = async (req, res) => {
    try{
        
        const payload = {
            username: process.env.TOPUP_USERNAME
        };
        const token = jwt.sign(payload, process.env.TOPUP_PASSWORD, { algorithm: 'HS256' }); 

        return res.status(200).send({status:true, message:'Token generated successfully', token:token})

    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }   

};

// เติมเงิน ais 
const topup_ais = async (req, res) => {
    try{
        const {amount,mobile} = req.body;
        const tokentopup = process.env.TOPUP_TOKEN;
        const username = process.env.TOPUP_USERNAME;
        const data = {
            reference_order:await runreference_order(),
            amount: amount,
            branch: username,
            service_id : 501,
            mobile: mobile
        };
        const apiResponse = await axios.post(`${process.env.TOPUP_URL}`,data,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokentopup}`
            },
        });
        if(apiResponse.data.status == 200){
            return res.status(200).send({status:true, message:apiResponse.data.message})
        }else{
            return res.status(400).send({status:false, message:apiResponse.data.message})
        }
    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

// เติมเงิน dtac
const topup_dtac = async (req, res) => {
    try{
        const {amount,mobile} = req.body;
        const tokentopup = process.env.TOPUP_TOKEN;
      
        const username = process.env.TOPUP_USERNAME;
        const data = {
            reference_order:await runreference_order(),
            amount: amount,
            branch: username,
            service_id : 502,
            mobile: mobile
        };
        const apiResponse = await axios.post(`${process.env.TOPUP_URL}`,data,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokentopup}`
            },
        });
        if(apiResponse.data.status == 200){
            return res.status(200).send({status:true, message:apiResponse.data.message})
        }else{
            return res.status(400).send({status:false, message:apiResponse.data.message})
        }
    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}
// เติมเงิน truemove
const topup_truemove = async (req, res) => {
    try{
        const {amount,mobile} = req.body;
        const tokentopup = process.env.TOPUP_TOKEN;
        const username = process.env.TOPUP_USERNAME;
        const data = {
            reference_order:await runreference_order(),
            amount: amount,
            branch: username,
            service_id : 504,
            mobile: mobile
        };
        const apiResponse = await axios.post(`${process.env.TOPUP_URL}`,data,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokentopup}`
            },
        });
        if(apiResponse.data.status == 200){
            return res.status(200).send({status:true, message:apiResponse.data.message})
        }else{
            return res.status(400).send({status:false, message:apiResponse.data.message})
        }
    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

// เติมเงิน mycat
const topup_mycat = async (req, res) => {
    try{
        const {amount,mobile} = req.body;
        const tokentopup = process.env.TOPUP_TOKEN;
        const username = process.env.TOPUP_USERNAME;
        const data = {
            reference_order:await runreference_order(),
            amount: amount,
            branch: username,
            service_id : 505,
            mobile: mobile
        };
        const apiResponse = await axios.post(`${process.env.TOPUP_URL}`,data,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokentopup}`
            },
        });
        if(apiResponse.data.status == 200){
            return res.status(200).send({status:true, message:apiResponse.data.message})
        }else{
            return res.status(400).send({status:false, message:apiResponse.data.message})
        }
    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

// เติมเงิน true wallet
const topup_truewallet = async (req, res) => {
    try{
        const {amount,mobile} = req.body;
        const tokentopup = process.env.TOPUP_TOKEN;

        const username = process.env.TOPUP_USERNAME;
        const data = {
            reference_order:await runreference_order(),
            amount: amount,
            branch: username,
            service_id : 529,
            mobile: mobile
        };
        const apiResponse = await axios.post(`${process.env.TOPUP_URL}`,data,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokentopup}`
            },
        });
        if(apiResponse.data.status == 200){
            return res.status(200).send({status:true, message:apiResponse.data.message})
        }else{
            return res.status(400).send({status:false, message:apiResponse.data.message})
        }
    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

// ซื้อบัตร true money
const topup_truemoney = async (req, res) => {
    try{
        const {amount,mobile} = req.body;
        const tokentopup = process.env.TOPUP_TOKEN;
        const username = process.env.TOPUP_USERNAME;
        const data = {
            reference_order:await runreference_order(),
            amount: amount,
            branch: username,
            service_id : 701,
            mobile: mobile
        };
        const apiResponse = await axios.post(`${process.env.TOPUP_URL}`,data,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokentopup}`
            },
        });
        if(apiResponse.data.status == 200){
            return res.status(200).send({status:true, message:apiResponse.data.message})
        }else{
            return res.status(400).send({status:false, message:apiResponse.data.message})
        }
    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}
// ซื้อบัตรเติมเงิน 12call
const topup_12call = async (req, res) => {
    try{
        const {amount,mobile} = req.body;
        const tokentopup = process.env.TOPUP_TOKEN;
        const username = process.env.TOPUP_USERNAME;
        const data = {
            reference_order:await runreference_order(),
            amount: amount,
            branch: username,
            service_id : 737,
            mobile: mobile
        };
        const apiResponse = await axios.post(`${process.env.TOPUP_URL}`,data,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokentopup}`
            },
        });
        if(apiResponse.data.status == 200){
            return res.status(200).send({status:true, message:apiResponse.data.message})
        }else{
            return res.status(400).send({status:false, message:apiResponse.data.message})
        }
    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

// เติมเงิน shopeepay
const topup_shopeepay = async (req, res) => {
    try{
        const {amount,mobile} = req.body;
        const tokentopup = process.env.TOPUP_TOKEN;
        const username = process.env.TOPUP_USERNAME;
        const data = {
            reference_order:await runreference_order(),
            amount: amount,
            branch: username,
            service_id : 6035,
            mobile: mobile
        };
        const apiResponse = await axios.post(`${process.env.TOPUP_URL}`,data,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokentopup}`
            },
        });
        if(apiResponse.data.status == 200){
            return res.status(200).send({status:true, message:apiResponse.data.message})
        }else{
            return res.status(400).send({status:false, message:apiResponse.data.message})
        }
    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

// เติมเงิน rabbit line pay
const topup_rabbitlinepay = async (req, res) => {
    try{
        const {amount,mobile,ref1} = req.body;
        const tokentopup = process.env.TOPUP_TOKEN;
        const username = process.env.TOPUP_USERNAME;
        const data = {
            reference_order:await runreference_order(),
            amount: amount,
            branch: username,
            service_id : 6036,
            mobile: mobile,
            ref1: ref1
        };
        const apiResponse = await axios.post(`${process.env.TOPUP_URL}`,data,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokentopup}`
            },
        });
        if(apiResponse.data.status == 200){
            return res.status(200).send({status:true, message:apiResponse.data.message})
        }else{
            return res.status(400).send({status:false, message:apiResponse.data.message})
        }
    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

// ส่ง sms
const send_sms = async (req, res) => {
    try{
        const {mobile,message} = req.body;
        const tokentopup = process.env.TOPUP_TOKEN;
        const username = process.env.TOPUP_USERNAME;
        const data = {
            reference_order:await runreference_order(),
            branch: username,
            mobile: mobile,
            message: message,
            service_id: 901
        };
        const apiResponse = await axios.post(`${process.env.TOPUP_URL}`,data,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokentopup}`
            },
        });
        if(apiResponse.data.status == 200){
            return res.status(200).send({status:true, message:apiResponse.data.message})
        }else{
            return res.status(400).send({status:false, message:apiResponse.data.message})
        }
    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}


//ดึงข้อมูลออเดอร์  by reference_order
const getorderbyreference_order = async (req, res) => {
    try{
        const reference_order = req.params.reference_order;
        const tokentopup = process.env.TOPUP_TOKEN;
        const apiResponse = await axios.get(`${process.env.TOPUP_URL}/${reference_order}`,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokentopup}`
            },
        });
        if(apiResponse.data.status == 200){
            return res.status(200).send({status:true, message:apiResponse.data.message})
        }else{
            return res.status(400).send({status:false, message:apiResponse.data.message})
        }
    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
} 

async function runreference_order() {

    // สุ่มเลขอ้างอิง 10 หลัก
    let reference_order = Math.floor(1000000000 + Math.random() * 9000000000);
    return reference_order;

    
}


module.exports = {
    gentoken,
    topup_ais,
    topup_dtac,
    topup_truemove,
    topup_mycat,
    topup_truewallet,
    topup_truemoney,
    topup_12call,
    topup_shopeepay,
    topup_rabbitlinepay,
    send_sms,
    getorderbyreference_order
    
}