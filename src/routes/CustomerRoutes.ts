import express   from "express"; 
import type { NextFunction,Request,Response } from "express"; 
import { CreateCustomer, LoginCustomer, OtpVerify } from "../controllers/Customer.js"; 
import rateLimit from "express-rate-limit"; 

export const OtpLimiter = rateLimit({
  windowMs: 30* 1000,
  max: 5, 
  message: 'Too many login attempts. Please try again in 30 sec'
});


const router=express.Router();    


router.post("/signup",CreateCustomer)
router.post("/signin",LoginCustomer) 
router.post("/verify-otp",OtpLimiter,OtpVerify)


router.get("/",(req:Request,res:Response,next:NextFunction)=>{
 try {
    res.send("I am healthy from the customer route").status(200)
 } catch (error) {
    
 }  
})





export {router as CustomerRoutes}