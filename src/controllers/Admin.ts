import type { Request, Response, NextFunction } from "express";
import { createvendor } from "../dto/Vendor.dto.js";
import { Vendor } from "../models/Vendor.models.js";
import { HashPassword } from "../utility/index.js";


export const CreateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validate = createvendor.safeParse(await req.body);
    if (!validate.success) {
      return res.send({ error: validate.error }).status(400);
    }
    const { data } = validate; 
    const vendorExists=await Vendor.findOne({email:data.email}); 
    if(vendorExists){
        return res.json({success:false,error:"Vendor already exist with this email id "}).status(409)
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
     
    return res.status(201).json({
      success: true,
      message: "Vendor created Successfully",
      data: created,
    });
  } catch (error) {
    return res
      .json({ error: "Internal Server Error", success: false })
      .status(500);
  }
};

export const GetallVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allvendor = await Vendor.find();

    return res
      .json({ message: "All Vendors ", success: true, data: allvendor })
      .status(200);
  } catch (error) { 
    console.log("error while getting all the vendors",error)
    return res
      .json({ error: "Internal server Error ", success: false })
      .status(500);
  }
};

export const GetVendorsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = await req.params;

    const vendor = await Vendor.findById({ _id: id });

    if (!vendor) {
      return res
        .json({ success: false, error: "No vendor exist with this id " })
        .status(404);
    }

    return res
      .json({ success: true, message: "Here is the vendor", data: vendor })
      .status(200);
  } catch (error) {
  console.log("while getting the vendor by specific id ",error)
  return res.json({error:"Internal Server Error"}).status(500);
  }
};
