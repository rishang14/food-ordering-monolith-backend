import type { Request, Response, NextFunction } from "express";
import {
  LoginSchema,
  vendorInputs,
  VendorServiceInputs,
} from "../dto/Vendor.dto.js";
import { Vendor } from "../models/Vendor.models.js";
import { GenrateToken, isPassEqual } from "../utility/index.js";
import { error } from "console";

export const vendorLogin = async (
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
    res.cookie("token", token, {
      maxAge: 3600000,
      httpOnly: true,
      secure: true,
    });
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

export const getVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // get vendor profile which contains name email and all
    const user = req.user;

    if (user) console.log(user);

    const vendor = await Vendor.findById({ _id: user?._id });
    return res
      .json({ success: true, message: "Vendor Profile", data: vendor })
      .status(200);
  } catch (error) {
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validate = vendorInputs.safeParse(req.body);

    if (!validate.success) {
      return res
        .json({ success: false, error: "Invalid Credentials" })
        .status(400);
    }

    const user = req.user;

    const vendor = await Vendor.findByIdAndUpdate(
      user?._id,
      {
        $set: validate.data,
      },
      { new: true }
    );

    return res
      .json({ success: true, message: "Vendor Profile is updated" })
      .status(200);
  } catch (error) {
    console.log("Error in update profile routes of vendor ", error);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    const validate = VendorServiceInputs.safeParse(req.body);

    if (!validate.success) {
      return res.json({ success: false, error: "Invalid Inputs" }).status(400);
    }

    const updatedService = await Vendor.findByIdAndUpdate(user?._id, {
      serviceAvailable: validate.data.serviceAvailable,
    });

    return res
      .json({
        success: true,
        message: "Service Updated Successfully",
        data: updatedService,
      })
      .status(200);
  } catch (error) {
    console.log("Error while updating the service ", error);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};
