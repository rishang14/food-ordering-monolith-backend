import type { Request, Response, NextFunction } from "express";
import { LoginSchema } from "../dto/Vendor.dto.js";
import { Vendor } from "../models/Vendor.models.js";
import { GenrateToken, isPassEqual, VerifyToken } from "../utility/index.js";

export const VendorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validate = LoginSchema.safeParse(await req.body);
    if (!validate.success) {
      return res
        .json({ success: false, error: "Validation Error" })
        .status(400);
    }
    const { data } = validate;
    const vendor = await Vendor.findOne({ email: data.email }).select(
      "+password"
    );

    if (!vendor) {
      return res
        .json({
          success: false,
          error: "Vendor Not Found",
        })
        .status(404);
    }

    const passEqual = await isPassEqual(data.password, vendor.password);
    if (!passEqual) {
      return res
        .json({ success: false, error: "Invalid Credentials" })
        .status(401);
    }
    const token = await GenrateToken({
      _id: vendor._id as string,
      email: vendor.email,
      name: vendor.name,
    });
    console.log(token, "token is generated");
    const verified = await VerifyToken(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGZiODc3MmFkYmUyY2YxYmIzZTUzMWYiLCJlbWFpbCI6Im93bmVyQGV4YW1wbGUuY29tIiwibmFtZSI6IlZlbmRvciBOYW1lIiwiaWF0IjoxNzYxMzIwMjAzLCJleHAiOjE3NjE0MDY2MDN9.jrH4r09_U9XzlYfIlo69Ry0dHBazbT4a5_gqym4Y5lY"
    );
    console.log(verified, "vefired");
    return res
      .json({ success: true, message: "user signed in successfully" })
      .status(200);
  } catch (error) {
    console.log("error while login vendor", error);
    return res
      .json({ error: "Internal Server Error ", success: false })
      .status(500);
  }
};
