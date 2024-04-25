const { customerShippop } = require("../../model/shippop/customer.model");
const { insuredExpress } = require("../../model/shippop/insured.model");
const { PercentCourier } = require("../../model/shippop/percent.model");
const { shippopBooking } = require("../../model/shippop/shippop.order");

priceList = async (req, res)=>{
    try{
        const percent = await PercentCourier.find();
        const id = req.decoded.userid
        const weight = req.body.parcel.weight 
        const declared_value = req.body.declared_value
        const formData = req.body
        const cod_amount = req.body.cod_amount
        
            if(weight == 0){
                return res
                        .status(400)
                        .send({status:false, message:"กรุณาระบุน้ำหนัก"})
            }

            if (!Number.isInteger(cod_amount)||
            !Number.isInteger(declared_value)) {
                    return res.status(400).send({
                        status: false,
                        message: `กรุณาระบุค่า COD หรือ มูลค่าสินค้า(ประกัน) เป็นจำนวนเต็มเท่านั้นห้ามใส่ทศนิยม`
                    });
                }

        //ผู้ส่ง
        const sender = formData.from; 
        const filterSender = { shop_id: shop , tel: sender.tel, status: 'ผู้ส่ง' }; //เงื่อนไขที่ใช้กรองว่ามีใน database หรือเปล่า

            const data_sender = { //ข้อมูลที่ต้องการอัพเดท หรือ สร้างใหม่
                ...sender,
                status: 'ผู้ส่ง',
                postcode: String(sender.postcode),
            };

        const optionsSender = { upsert: true }; // upsert: true จะทำการเพิ่มข้อมูลถ้าไม่พบข้อมูลที่ตรงกับเงื่อนไข
    
        const resultSender = await customerShippop.updateOne(filterSender, data_sender, optionsSender);
            if (resultSender.upsertedCount > 0) {
                console.log('สร้างข้อมูลผู้ส่งคนใหม่');
            } else {
                console.log('อัปเดตข้อมูลผู้ส่งเรียบร้อย');
            }
    
        const infoSender = await customerShippop.findOne(filterSender)
            if(!infoSender){
                console.log('ไม่มีข้อมูลผู้ส่ง')
            }

        //ผู้รับ
        const recipient = formData.to; // ผู้รับ
        const filter = { ID: id, tel: recipient.tel, status: 'ผู้รับ' }; //เงื่อนไขที่ใช้กรองว่ามีใน database หรือเปล่า

            const update = { //ข้อมูลที่ต้องการอัพเดท หรือ สร้างใหม่
                ...recipient,
                status: 'ผู้รับ',
                postcode: String(recipient.postcode),
            };

        const options = { upsert: true }; // upsert: true จะทำการเพิ่มข้อมูลถ้าไม่พบข้อมูลที่ตรงกับเงื่อนไข
        
        const result = await customerShippop.updateOne(filter, update, options);
            if (result.upsertedCount > 0) {
                console.log('สร้างข้อมูลผู้รับคนใหม่');
            } else {
                console.log('อัปเดตข้อมูลผู้รับเรียบร้อย');
            }

        let data = [];
            data.push({
                "from": {
                    "name": req.body.from.name,
                    "address": req.body.from.address,
                    "district": req.body.from.district,
                    "state": req.body.from.state,
                    "province": req.body.from.province,
                    "postcode": req.body.from.postcode,
                    "tel": req.body.from.tel
                },
                "to": {
                    "name": req.body.to.name,
                    "address": req.body.to.address,
                    "district": req.body.to.district,
                    "state": req.body.to.state,
                    "province": req.body.to.province,
                    "postcode": req.body.to.postcode,
                    "tel": req.body.to.tel
                },
                "parcel": {
                    "name": req.body.parcel.name,
                    "weight": weight,
                    "width": req.body.parcel.width,
                    "length": req.body.parcel.length,
                    "height": req.body.parcel.height
                },
            //DHL FLE
                "showall": 1,
        });
        const value = {
            api_key: process.env.SHIPPOP_API_KEY,
            data: data,
        };
        const resp = await axios.post(`${process.env.SHIPPOP_URL}/pricelist/`,value,
            {
                headers: {"Accept-Encoding": "gzip,deflate,compress"},
            }
        )
        if (!resp.data.status) {
            return res
                    .status(400)
                    .send({status: false, message: resp.data.message});
        }
        const obj = resp.data.data[0];
        const new_data = [];

        const findinsured = await insuredExpress.findOne({express:"SHIPPOP"})
        let insuranceFee = 0
            if(findinsured){
                    // console.log(findinsured.product_value)
                    let product_value = findinsured.product_value
                    for (let i = 0; i < product_value.length; i++){
                        if (declared_value >= product_value[i].valueStart && declared_value <= product_value[i].valueEnd){
                            insuranceFee = product_value[i].insurance_fee
                            break;
                        }
                    }
            }
            console.log(insuranceFee)

            for (const ob of Object.keys(obj)) {
                if (obj[ob].available) {
                    if (reqCod > 0 && obj[ob].courier_code == 'ECP') {
                        console.log('Encountered "ECP". Skipping this iteration.');
                        continue; // ข้ามไปยังรอบถัดไป
                    }
                    // ทำการประมวลผลเฉพาะเมื่อ obj[ob].available เป็น true
                    let v = null;
                    let p = percent.find(element => element.courier_code == obj[ob].courier_code);
                    // console.log(p)
                        if (!p) {
                            console.log(`ยังไม่มี courier name: ${obj[ob].courier_code}`);
                        }
                    // คำนวนต้นทุนของร้านค้า
                    let cost_hub = Number(obj[ob].price);
                    let cost = Math.ceil(cost_hub + p.profit_nba); 
                    let price = Math.ceil(cost + p.profit_shop);

                    v = {
                        ...obj[ob],
                        price_remote_area: 0,
                        cost_hub: cost_hub,
                        cost: cost,
                        cod_amount: Number(cod_amount.toFixed()),
                        fee_cod: 0,
                        profitPartner: 0,
                        price: Number(price.toFixed()),
                        declared_value: declared_value,
                        insuranceFee: insuranceFee,
                        total: 0,
                    };

                    if(obj[ob].hasOwnProperty("price_remote_area")){ //เช็คว่ามี ราคา พื้นที่ห่างไกลหรือเปล่า
                            let total = price + obj[ob].price_remote_area + insuranceFee
                                v.price_remote_area = obj[ob].price_remote_area
                                v.total = total 
                    }else{
                            let total = price + insuranceFee
                                v.total = total
                    }
                    new_data.push(v);
                    
                    // console.log(new_data);
                } else {
                    // ทำสิ่งที่คุณต้องการทำเมื่อ obj[ob].available เป็น false
                    console.log(`Skipping ${obj[ob].courier_code} because available is false`);
                }
            }

        return res
                .status(200)
                .send({ 
                    status: true, 
                    origin_data: req.body, 
                    new: new_data,
                    sender: infoSender
                });
    }catch(err){
        console.log(err)
        return res
                .status(500)
                .send({status:false, message:err.message})
    }
}

booking = async(req, res)=>{
    try{
        const formData = req.body
        const price = req.body.price
        const weight = req.body.parcel.weight
        const id = req.decoded.userid
        const price_remote_area = req.body.price_remote_area
        formData.parcel.weight = weight
        const data = [{...formData}] //, courier_code:courierCode

        const invoice = await invoiceNumber()
        console.log(invoice)
        
        const value = {
            api_key: process.env.SHIPPOP_API_KEY,
            email: "OrderHUB@gmail.com",
            url: {
                "success": "http://shippop.com/?success",
                "fail": "http://shippop.com/?fail"
            },
            data: data,
            force_confirm: 1
        };
        
        const resp = await axios.post(`${process.env.SHIPPOP_URL}/booking/`,value,
            {
              headers: {"Accept-Encoding": "gzip,deflate,compress",
                        "Content-Type": "application/json"},
            }
          );
            if (!resp.data.status) {
                return res
                        .status(400)
                        .send({status: false, message: resp.data.data[0]});
            }
        const Data = resp.data.data[0]
        const parcel = data[0].parcel
        const new_data = []
        const v = {
                ...Data, //มี declared_value และ cod_amount อยู่แล้วใน ...Data ไม่ต้องสร้างเพิ่ม
                parcel: parcel,
                invoice: invoice,
                employee_id: id,
                purchase_id: String(resp.data.purchase_id),
                total: resp.data.total_price,
                price_remote_area: price_remote_area,
                price: Number(price.toFixed()),
          };
         new_data.push(v);

        const createOrder = await shippopBooking.create(v)
            if(!createOrder){
                console.log("ไม่สามารถสร้างข้อมูล booking ได้")
            }
        
        return res
                .status(200)
                .send({status:true, data:new_data})
    }catch(err){
        console.log(err)
        return res
                .status(500)
                .send({status:false, message:"มีบางอย่างผิดพลาด"})
    }
}

cancelOrder = async(req, res)=>{
    try{
        const tracking_code = req.params.tracking_code
        const valueCheck = {
            api_key: process.env.SHIPPOP_API_KEY,
            tracking_code: tracking_code,
        };
        const findStatus = await shippopBooking.findOne({ tracking_code: tracking_code });
            if (!findStatus) {
                return res
                        .status(400)
                        .send({ status: false, message: "ไม่มีหมายเลขที่ท่านกรอก" });
            }else if(findStatus.order_status == 'cancel'){
                return res
                        .status(404)
                        .send({status: false, message:"หมายเลขสินค้านี้ถูก cancel ไปแล้ว"})
            }

        const respStatus = await axios.post(`${process.env.SHIPPOP_URL}/cancel/`,valueCheck,
                    {
                        headers: {"Accept-Encoding": "gzip,deflate,compress",
                                "Content-Type": "application/json"},
                    }
                )
        if(respStatus.data.status != true){
                return res
                        .status(400)
                        .send({
                            status: false, 
                            message:"ไม่สามารถทำการยกเลิกสินค้าได้"
                        })
        }else{
                const findPno = await shippopBooking.findOneAndUpdate(
                        { tracking_code: tracking_code },
                        { $set: { order_status: 'cancel' } },
                        { new: true }
                    );
                    if(!findPno){
                        return res
                                .status(400)
                                .send({status:false, message:"ไม่สามารถค้นหาหมายเลข tracking_code หรืออัพเดทข้อมูลได้"})
                    }
                return res
                        .status(200)
                        .send({status:false, data:findPno})
        }
  
    }catch(err){
        console.log(err)
        return res
                .status(500)
                .send({status:false, message:err.message})
    }
}

tracking = async (req, res)=>{
    try{
        const tracking = req.params.id
        const valueCheck = {
            api_key: process.env.SHIPPOP_API_KEY,
            tracking_code: tracking,
        };
        const resp = await axios.post(`${process.env.SHIPPOP_URL}/tracking/`,valueCheck,
            {
            headers: {"Accept-Encoding": "gzip,deflate,compress",
                        "Content-Type": "application/json"},
            }
        )
            if(!resp){
                return res
                        .status(400)
                        .send({status:false, message:"ไม่สามารถหาหมายเลข Tracking ได้"})
            }
        // console.log(resp.data.order_status)
        return res
                .status(200)
                .send({status:true, data:resp.data})
    }catch(err){
        console.log(err)
        return res
                .status(500)
                .send({status:false, message:err.message})
    }
}

labelHtml = async (req, res)=>{ //ใบแปะหน้าโดย purchase(html)
    try{
        const valueCheck = {
            api_key: process.env.SHIPPOP_API_KEY,
            purchase_id: req.body.purchase_id,
            type:"html",
            size: req.body.size,
            logo: "https://drive.google.com/thumbnail?id=1-ibHHTEzCLaRisxTJa0FKa653kNpQT-L"
        };
        const resp = await axios.post(`${process.env.SHIPPOP_URL}/v2/label/`,valueCheck,
            {
                headers: {"Accept-Encoding": "gzip,deflate,compress",
                            "Content-Type": "application/json"},
            }
        )
        if(resp){
            return res
                    .status(200)
                    .send(resp.data.html)
        }else{
            return res
                    .status(400)
                    .send({status:false, message:"ไม่สามารถหาหมายเลข Tracking ได้"})
        }
    }catch(err){
        console.log(err)
        return res
                .status(500)
                .send({status:false, message:err.message})
    }
}

async function invoiceNumber() {
    data = `TSP`
    let random = Math.floor(Math.random() * 100000000000)
    const combinedData = data + random;
    const findInvoice = await shippopBooking.find({invoice:combinedData})

    while (findInvoice && findInvoice.length > 0) {
        // สุ่ม random ใหม่
        random = Math.floor(Math.random() * 100000000000);
        combinedData = data + random;

        // เช็คใหม่
        findInvoice = await shippopBooking.find({invoice: combinedData});
    }

    console.log(combinedData);
    return combinedData;
}

module.exports = { priceList, booking ,cancelOrder, tracking, labelHtml }