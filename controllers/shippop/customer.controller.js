const { customerShippop } = require("../../model/shippop/customer.model");

getAll = async (req, res)=>{
    try{
        const get = await customerShippop.find()
        if(get){
            return res
                    .status(200)
                    .send({status:true, data: get})
        }else{
            return res
                    .status(400)
                    .send({status:false, message:"ไม่สามารถค้นหาได้"})
        }
    }catch(err){
        return res
                .status(500)
                .send({status: false, message:"มีบางอย่างผิดพลาด"})
    }
}

delend = async (req, res)=>{
    try{
        const id = req.params.id
        const deleteDrop = await customerShippop.findByIdAndDelete(id)
        if(deleteDrop){
            return res
                    .status(200)
                    .send({status:true, delete: deleteDrop})
        }else{
            return res
                    .status(400)
                    .send({status:false, message:"ไม่สามารถลบได้"})
        }
    }catch(err){
        return res 
                .status(500)
                .send({status:false, message:"มีบางอย่างผิดพลาด"})
    }
}

getReceive = async (req, res)=>{
    try{
        const findReceive = await customerShippop.find({status:"ผู้รับ"})
                .sort({ createdAt : -1})
        if(!findReceive){
            return res
                    .status(400)
                    .send({status:false, message:"ท่านไม่มีข้อมูลผู้รับ กรุณากรอกข้อมูลและทำการเช็คราคาเพื่อบันทึกข้อมูลผู้รับก่อน"})
        }
        return res
                .status(200)
                .send({status:true, message:findReceive})
    }catch(err){
        console.log("มีบางอย่างผิดพลาด")
        return res
                .status(500)
                .send({status:false, message:err})
    }
}

getSender = async (req, res)=>{
    try{
        const findSender = await customerShippop.find({status:"ผู้ส่ง"})
                .sort({ createdAt : -1})
        if(!findSender){
            return res
                    .status(400)
                    .send({status:false, message:"ท่านไม่มีข้อมูลผู้ส่ง กรุณากรอกข้อมูลและทำการเช็คราคาเพื่อบันทึกข้อมูลผู้รับก่อน"})
        }
        return res
                .status(200)
                .send({status:true, message:findSender})
    }catch(err){
        console.log("มีบางอย่างผิดพลาด")
        return res
                .status(500)
                .send({status:false, message:err})
    }
}

getOneSender = async (req, res)=>{
    try{
        const id = req.params.id
        const findOneSender = await customerShippop.findOne({_id:id})
            if(!findOneSender){
                return res
                        .status(400)
                        .send({status:false, message:"ท่านไม่มีข้อมูลผู้ส่ง กรุณากรอกข้อมูลและทำการเช็คราคาเพื่อบันทึกข้อมูลผู้ส่งก่อน"})
            }
        return res
                .status(200)
                .send({status:true, message:findOneSender})
    }catch(err){
        console.log("มีบางอย่างผิดพลาด")
        return res
                .status(500)
                .send({status:false, message:err})
    }
}

module.exports = { getAll, delend, getReceive, getSender, getOneSender}