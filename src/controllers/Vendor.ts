import type { Request, Response, NextFunction } from "express";
import { LoginSchema } from "../dto/Vendor.dto.js";
import { Vendor } from "../models/Vendor.models.js";
import { isPassEqual } from "../utility/index.js";

export const VendorLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validate = LoginSchema.safeParse(await req.body);
    if (!validate.success) {
      return res
        .json({ success: false, error: "Validation Error" })
        .status(400);
    }
    const { data } = validate;
    const vendor = await Vendor.findOne({ email: data.email }).select("+password");

    if (!vendor) {
      return res.json({
          success: false,
          error: "Vendor Not Found",
        }).status(404);
    }
    
    console.log(vendor,"vendor")
    const passEqual = await  isPassEqual(data.password, vendor.password);
    if (!passEqual) {
      return res
        .json({ success: false, error: "Invalid Credentials" })
        .status(401);
    }

    return res.json({ success: true, message: "user signed in successfully" }).status(200);
  } catch (error) {
    console.log("error while login vendor", error);
    return res
      .json({ error: "Internal Server Error ", success: false })
      .status(500);
  }
};
