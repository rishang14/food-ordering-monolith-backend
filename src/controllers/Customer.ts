import type { NextFunction, Request,Response } from "express";  



const CreateCustomer=async(req:Request,res:Response)=>{
try { 
//get the email pass name add phone no 
// save in the db and then create a otp with the expiry of 1 hr  
// 
    
} catch (error) {
    console.log("Error while creating the customer",error); 
    return res.json({success:false,error:"Internal Server Error"}).status(500)
}
}