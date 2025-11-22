import express from "express";
import type { NextFunction, Request, Response } from "express";
import {
  addFoodItemTocart,
  CreateCustomer,
  emptyCart,
  LoginCustomer,
  OtpVerify,
  removeFromTheCart,
} from "../controllers/Customer.js";
import rateLimit from "express-rate-limit";
import { Auth } from "../middleware/Auth.ts";

export const OtpLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 5,
  message: "Too many login attempts. Please try again in 30 sec",
});

const router = express.Router();

router.post("/signup", CreateCustomer);
router.post("/signin", LoginCustomer);
router.use(Auth);
router.post("/verify-otp", OtpLimiter, OtpVerify);
router.post("/addtocart", addFoodItemTocart);
router.patch("/remvoeitemfromcart:foodId", removeFromTheCart);
router.delete("/emptycart", emptyCart);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.send("I am healthy from the customer route").status(200);
  } catch (error) {}
});

export { router as CustomerRoutes };
