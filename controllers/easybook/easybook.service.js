const axios = require("axios");

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

