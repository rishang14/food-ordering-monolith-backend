import express   from "express"; 
import type { NextFunction,Request,Response } from "express"; 
import { CreateCustomer } from "../controllers/Customer.js";



const router=express.Router();    


router.post("/signup",CreateCustomer)



router.get("/",(req:Request,res:Response,next:NextFunction)=>{
 try {
    res.send("I am healthy from the customer route").status(200)
 } catch (error) {
    
 }  
})





export {router as CustomerRoutes}