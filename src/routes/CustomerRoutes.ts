import express from "express";
import type { NextFunction, Request, Response } from "express";
import {
  addFoodItemTocart,
  createCustomer,
  createOrder,
  emptyUserCart,
  getCustomerProfile,
  loginCustomer,
  otpVerify,
  removeFromTheCart,
  updateCustomerProfile,
} from "../controllers/Customer.ts";
import rateLimit from "express-rate-limit";
import { Auth } from "../middleware/Auth.ts";

export const otpLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 3,
  message: "Too many login attempts. Please try again in 30 sec",
});

const router = express.Router();

router.post("/signup", createCustomer);
router.post("/signin", loginCustomer);
router.use(Auth);
router.post("/verify-otp", otpLimiter, otpVerify); 
router.get("/profile",getCustomerProfile); 
router.patch("/updateprofile",updateCustomerProfile); 
router.post("/addtocart", addFoodItemTocart);
router.patch("/remvoeitemfromcart/:foodId", removeFromTheCart);
router.delete("/emptycart", emptyUserCart); 
router.post("/createorder",createOrder)   

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.send("I am healthy from the customer route").status(200);
  } catch (error) {}
});

export { router as CustomerRoutes };
