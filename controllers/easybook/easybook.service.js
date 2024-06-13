const axios = require("axios");
const crypto = require('crypto');
const e = require("express");

const username = process.env.EASYBOOK_USERNAME
const password = process.env.EASYBOOK_PASSWORD

let tokeneasybook = null
let tokenexpire = null

const getNewToken = async(req, res)=>{
    try{
      //ต่อ api get token
        const form = new URLSearchParams();
        form.append('grant_type', 'password');
        form.append('username', username);
        form.append('password', password);
        const api ={
            url: `${process.env.EASYBOOK_URL}/token`,
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',       
            },
            data: form
        }
       
        const response = await axios(api).catch((err) => {
          
            return "ไม่สามารถเชื่อมต่อกับ api ได้"
        });
        
        if(response?.data){
            
            tokeneasybook = response.data.access_token
            //ตั้งเวลาหมดอายุ token ไว้ 3 ชั่วโมง
            tokenexpire = new Date(new Date().getTime() + 3*60*60*1000)
            return {tokeneasybook: tokeneasybook, tokenexpire: tokenexpire}
        }else{
            return "ไม่สามารถเชื่อมต่อกับ api ได้"
        }
    }catch(err){
        return "ไม่สามารถเชื่อมต่อกับ api ได้"
    }
}

//รถบัส
//ดึงข้อมูลจังหวัด
exports.getProvince = async(req, res)=>{
    try{
        console.log("Test7")
        //เช็คว่า token ยัง null อยู่ไหม และ หมดอายุหรือยัง
        if(tokeneasybook == null || tokenexpire == null || new Date() > tokenexpire){
            const newtoken = await getNewToken()
           
            if(newtoken == "ไม่สามารถเชื่อมต่อกับ api ได้"){
                return res.status(500).send({status:false, message:"ไม่สามารถเชื่อมต่อกับ api ได้"})
            }
            tokeneasybook = newtoken?.tokeneasybook
            tokenexpire = newtoken?.tokenexpire
            console.log("new token")
            
        }

        const api ={
            url: `${process.env.EASYBOOK_URL}/api/bus/agent/places?sign=${process.env.EASYBOOK_SIGNATURE}&language=th`,
            method: 'get',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokeneasybook}`
            }
        }
        const response = await axios(api).catch((err) => {
           
            return "ไม่สามารถเชื่อมต่อกับ api ได้"
        });
        if(response?.status == 200){
            let data =  response?.data?.Places;
            data = data.filter((item)=> item.CountryName == "ประเทศไทย")
            
            return res.status(200).send({status:true, data:data})
        }else{
            return res.status(500).send({status:false, message:response})
        }
    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

//ดึงข้อมูล สถานีรถบัส
exports.getBusStation = async(req, res)=>{
    try{
        console.log("Test6")
        //เช็คว่า token ยัง null อยู่ไหม และ หมดอายุหรือยัง
        if(tokeneasybook == null || tokenexpire == null || new Date() > tokenexpire){
            const newtoken = await getNewToken()
            if(newtoken == "ไม่สามารถเชื่อมต่อกับ api ได้"){
                return res.status(500).send({status:false, message:"ไม่สามารถเชื่อมต่อกับ api ได้"})
            }
            tokeneasybook = newtoken?.tokeneasybook
            tokenexpire = newtoken?.tokenexpire
            console.log("new token")
        }
        //ดึงข้อมูล สถานีรถบัส
        const api ={
            url: `${process.env.EASYBOOK_URL}/api/bus/agent/subplaces?sign=${process.env.EASYBOOK_SIGNATURE}&language=th`,
            method: 'get',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokeneasybook}`
            }
        }
        const response = await axios(api).catch((err) => {
            return "ไม่สามารถเชื่อมต่อกับ api ได้"
        });
        if(response?.status == 200){
            let data =  response?.data?.Subplaces;
            data = data.filter((item)=> item.CountryName == "ประเทศไทย")
            return res.status(200).send({status:true, data:data})
        }else{
            return res.status(500).send({status:false, message:response})
        }

    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

// ดูข้อมูลเที่ยวรถบัส
exports.gettrips = async(req,res)=>{
    try{
        console.log("Test5")
        //เช็คว่า token ยัง null อยู่ไหม และ หมดอายุหรือยัง
        if(tokeneasybook == null || tokenexpire == null || new Date() > tokenexpire){
            const newtoken = await getNewToken()
            if(newtoken == "ไม่สามารถเชื่อมต่อกับ api ได้"){
                return res.status(500).send({status:false, message:"ไม่สามารถเชื่อมต่อกับ api ได้"})
            }
            tokeneasybook = newtoken?.tokeneasybook
            tokenexpire = newtoken?.tokenexpire
            console.log("new token")
        }
        //ดึงข้อมูล เที่ยวสถานีรถบัส
        const data = {
            DepartureStartDate: req.body.DepartureStartDate,
            DepartureEndDate: req.body.DepartureEndDate,
            FromPlaceId: req.body.FromPlaceId,
            FromSubPlaceId: req.body?.FromSubPlaceId,
            ToPlaceId: req.body.ToPlaceId,
            ToSubPlaceId: req.body?.ToSubPlaceId,
            Pax: req.body.Pax,
            Currency:"THB",
            
        };
        const api ={
            url: `${process.env.EASYBOOK_URL}/api/bus/agent/gettrips?sign=${process.env.EASYBOOK_SIGNATURE}&language=th`,
            method: 'post',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokeneasybook}`
            },
            data: data
        }
        const response = await axios(api).catch((err) => {
            return "ไม่สามารถเชื่อมต่อกับ api ได้"
        });
        if(response?.status == 200){
            return res.status(200).send({status:true, data:response?.data?.Trips})
        }else{
            return res.status(500).send({status:false, message:response})
        }


    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

//ดึงข้อมูลที่นั่ง รถบัส
exports.getseat = async(req,res)=>{
    try{
        console.log("Test4")
        //เช็คว่า token ยัง null อยู่ไหม และ หมดอายุหรือยัง
        if(tokeneasybook == null || tokenexpire == null || new Date() > tokenexpire){
            const newtoken = await getNewToken()
            if(newtoken == "ไม่สามารถเชื่อมต่อกับ api ได้"){
                return res.status(500).send({status:false, message:"ไม่สามารถเชื่อมต่อกับ api ได้"})
            }
            tokeneasybook = newtoken?.tokeneasybook
            tokenexpire = newtoken?.tokenexpire
            console.log("new token")
        }
        //ดึงข้อมูล เที่ยวสถานีรถบัส
        const data = {
            TripKey: req.body.TripKey,
            Currency:"THB",
        };
        const api ={
            url: `${process.env.EASYBOOK_URL}/api/bus/agent/queryseat?sign=${process.env.EASYBOOK_SIGNATURE}&language=th`,
            method: 'post',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokeneasybook}`
            },
            data: data
        }
        const response = await axios(api).catch((err) => {
            return "ไม่สามารถเชื่อมต่อกับ api ได้"
        });
        if(response?.status == 200){
            return res.status(200).send({status:true, data:response?.data?.BusSeatPlan})
        }else{
            return res.status(500).send({status:false, message:response})
        }

    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

//เช็คราคาผลรวม รถบัส
exports.getbookingfare = async(req,res)=>{
    try{
        console.log("Test3")
        //เช็คว่า token ยัง null อยู่ไหม และ หมดอายุหรือยัง
        if(tokeneasybook == null || tokenexpire == null || new Date() > tokenexpire){
            const newtoken = await getNewToken()
            if(newtoken == "ไม่สามารถเชื่อมต่อกับ api ได้"){
                return res.status(500).send({status:false, message:"ไม่สามารถเชื่อมต่อกับ api ได้"})
            }
            tokeneasybook = newtoken?.tokeneasybook
            tokenexpire = newtoken?.tokenexpire
            console.log("new token")
        }
        //ดึงข้อมูลเช็คราคาผลรวม รถบัส
        const data = {
            Currency:"THB",
            DepartureTripKey: req.body.DepartureTripKey,
            DepartAdultPax: req.body.DepartAdultPax,
            DepartFromSubSubPlaceId: req.body.DepartFromSubSubPlaceId,
            DepartToSubSubPlaceId: req.body.DepartToSubSubPlaceId,
            SelectedDepartureSeats: req.body.SelectedDepartureSeats
        };
        const api ={
            url: `${process.env.EASYBOOK_URL}/api/bus/agent/getbookingfare?sign=${process.env.EASYBOOK_SIGNATURE}&language=th`,
            method: 'post',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokeneasybook}`
            },
            data: data
        }
        const response = await axios(api).catch((err) => {
            return "ไม่สามารถเชื่อมต่อกับ api ได้"
        });
        if(response?.status == 200){
            return res.status(200).send({status:true, data:response?.data?.BookingFare})
        }else{
            return res.status(500).send({status:false, message:response})
        }

    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

//จองเที่ยวรถบัส
exports.getbooking = async(req,res)=>{
    try{
        
        //เช็คว่า token ยัง null อยู่ไหม และ หมดอายุหรือยัง
        if(tokeneasybook == null || tokenexpire == null || new Date() > tokenexpire){
            const newtoken = await getNewToken()
            if(newtoken == "ไม่สามารถเชื่อมต่อกับ api ได้"){
                return res.status(500).send({status:false, message:"ไม่สามารถเชื่อมต่อกับ api ได้"})
            }
            tokeneasybook = newtoken?.tokeneasybook
            tokenexpire = newtoken?.tokenexpire
            console.log("new token")
        }
        //จองที่นั่งรถบัส
        const data = {
            Currency:"THB",
            DepartureTripKey: req.body.DepartureTripKey,
            CollectorInfo:req.body.CollectorInfo,
            DepartPassengers: req.body.DepartPassengers,
            Remark: req.body.Remark,
            IpAddress: req.ip,
            DepartFromSubSubPlaceId: req.body.DepartFromSubSubPlaceId,
            DepartToSubSubPlaceId: req.body.DepartToSubSubPlaceId,
        };
        const api ={
            url: `${process.env.EASYBOOK_URL}/api/bus/agent/reserveseat?sign=${process.env.EASYBOOK_SIGNATURE}&language=th`,
            method: 'post',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokeneasybook}`
            },
            data: data
        }
        const response = await axios(api).catch((err) => {
            return "ไม่สามารถเชื่อมต่อกับ api ได้"
        });
        if(response?.status == 200){
            console.log(response?.data)
            const data2 ={
                ReserveReference: response?.data?.ReserveReference,
                FinalAmount: response?.data?.FinalAmount,
                SendOrderSummaryEmail: true
            }
            console.log(data2)
            const api2 ={
                url: `${process.env.EASYBOOK_URL}/api/bus/agent/bookseat?sign=${process.env.EASYBOOK_SIGNATURE}&language=th`,
                method: 'post',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokeneasybook}`
                },
                data: data2
            }
            const responsecon = await axios(api2).catch((err) => {
                return "ไม่สามารถเชื่อมต่อกับ api ได้"
            });

            if(responsecon?.status == 200){
                return res.status(200).send({status:true, data:responsecon?.data?.OrderNumber})
            }else{
                return res.status(500).send({status:false, message:responsecon})
            }
        }else{
            return res.status(500).send({status:false, message:response})
        }
    }catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}
//ดึงออเดอร์รถบัส

exports.signature = async(req, res)=>{
    try{
        const SECRET_KEY = process.env.EASYBOOK_SECRET_KEY; // ตั้งค่า SECRET_KEY ตามที่คุณต้องการ
        const PASSWORD = process.env.EASYBOOK_PASSWORD; // ตั้งค่า PASSWORD ตามที่คุณต้องการ

        const input = "easybook" + SECRET_KEY + PASSWORD;
        const md5Hash = crypto.createHash('md5');
        md5Hash.update(input, 'utf8');
        const result = md5Hash.digest('hex');
    
        return res.status(200).send({status:true, data:result})

    }catch(err){
        return res.status(500).send({status:false, message:err})
    }
}

