const axios = require("axios");
const crypto = require('crypto');

const username = process.env.EASYBOOK_USERNAME
const password = process.env.EASYBOOK_PASSWORD

exports.getToken = async(req, res)=>{
    try{
        const URL = process.env.EASYBOOK_TOKEN
        const value = {
            grant_type:"password",
            username:username,
            password:password
        }
        console.log(value, URL)
        const resp = await axios.post(URL, value,
                {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            )
            if(!resp){
                return res
                        .status(400)
                        .send({status:false, message:"ไม่สามารถส่งคำขอเรียก Token ได้"})
            }
        return res
                .status(200)
                .send({status:false, data:resp})
    }catch(err){
        return res
                .status(500)
                .send({status:false, message:err})
    }
}

exports.signature = async(req, res)=>{
    try{
        const SECRET_KEY = '12345'; // ตั้งค่า SECRET_KEY ตามที่คุณต้องการ
        const PASSWORD = 'easybookapi2017'; // ตั้งค่า PASSWORD ตามที่คุณต้องการ

        const input = "easybook" + SECRET_KEY + PASSWORD;
        const md5Hash = crypto.createHash('md5');
        md5Hash.update(input, 'utf8');
        const result = md5Hash.digest('hex');
    
        return res.status(200).send({status:true, data:result})

    }catch(err){
        return res.status(500).send({status:false, message:err})
    }
}

