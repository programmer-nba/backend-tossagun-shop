const { shippopBooking } = require("../../model/shippop/shippop.order");

update = async(req, res)=>{
    try{
        const id = req.params.id
        const formData = req.body
        const findOrder = await shippopBooking.findByIdAndUpdate(
            id,
            {
                ...formData
            },
            {new:true})
            if(!findOrder){
                return res
                        .status(404)
                        .send({status:false, message:"ไม่สามารถค้นหาออเดอร์ที่ท่านต้องการได้"})
            }
        return res
                .status(200)
                .send({status:false, data:findOrder})
    }catch(err){
        return res
                .status(500)
                .send({status:false, message:err})
    }
}

delend = async(req, res)=>{
    try{
        const id = req.params.id
        const del = await shippopBooking.findByIdAndDelete(id)
            if(!del){
                return res
                        .status(404)
                        .send({status:false, message:"ไม่สามารถค้นหาหมายเลขออเดอร์ที่ต้องการลบได้"})
            }
        return res
                .status(200)
                .send({status:true, data:del})
    }catch(err){
        return res
                .status(500)
                .send({status:false, message:err})
    }
}

getAll = async(req, res)=>{
    try{
        const find = await shippopBooking.find()
            if(find.length == 0){
                return res
                        .status(200)
                        .send({status:true, data:[]})
            }
        return res
                .status(200)
                .send({status:true, data:find})
    }catch(err){
        return res
                .status(500)
                .send({status:false, message:err})
    }
}

getById = async(req, res)=>{
    try{
        const id = req.params.id
        const findId = await shippopBooking.findById(id)
            if(!findId){
                return res
                        .status(404)
                        .send({status:false, message:"ไม่พบออเดอร์ที่ท่านต้องการหา"})
            }
        return res  
                .status(200)
                .send({status:false, data:findId})
    }catch(err){
        return res
                .status(500)
                .send({status:false, message:err})
    }
}

module.exports = { update, delend, getAll, getById }