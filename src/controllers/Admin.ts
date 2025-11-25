import type { Request, Response, NextFunction } from "express";
import { createvendor } from "../dto/Vendor.dto.js";
import { Vendor } from "../models/Vendor.models.js";
import { HashPassword } from "../utility/index.js";
import { ApiError } from "../utility/apiError.ts";
import z from "zod";
import { ApiResponse } from "../utility/apiresponse.ts";

export const CreateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validate = createvendor.safeParse(await req.body);
    if (!validate.success) {
      throw new ApiError(400, "Invalid inputs", z.treeifyError(validate.error));
    }
    const { data } = validate;
    const vendorExists = await Vendor.findOne({ email: data.email });
    if (vendorExists) {
      throw new ApiError(409, "Vendor already exist with this email id ");
    }
    const hashPass = await HashPassword(data.password);
    const created = await Vendor.create({
      name: data.name,
      ownerName: data.ownername,
      password: hashPass,
      foodType: data.foodType,
      email: data.email,
      phone: data.phone,
      pincode: data.pincode,
    });

    return new ApiResponse(201, created, "Vendor created Successfully");
  } catch (error: any) {
    return new ApiError(500, error.message || "Inernal Server Error");
  }
};

export const GetallVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allvendor = await Vendor.find();

    return new ApiResponse(200, "All Vendors ");
  } catch (error:any) {
    console.log("error while getting all the vendors", error);
    return new ApiError(500,error.message, "Internal server Error ")
  }
};

export const GetVendorsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } =  req.params;

    const vendor = await Vendor.findById({ _id: id });

    if (!vendor) {
      return new ApiError(404, "No vendor exist with this id ")
    }

    return new ApiResponse(200,vendor,"Here is the vendor")
  } catch (error:any) {
    console.log("while getting the vendor by specific id ", error);
    return new ApiError(500,error.message, "Internal server Error ")
  }
};
