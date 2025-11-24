import type { Request, Response, NextFunction } from "express";
import {
  FoodInput,
  LoginSchema,
  vendorInputs,
  VendorServiceInputs,
} from "../dto/index.ts";
import { Vendor, Foods, Order } from "../models/index.ts";
import { GenrateToken, isPassEqual } from "../utility/index.ts";
import z from "zod";
import { Types } from "mongoose";
import { remvoeOrderJob } from "../queue/order.producer.ts";

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

    res.cookie("token", token, {
      maxAge: 60 * 60 * 1000,
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
        .json({
          success: false,
          error: "Invalid Credentials",
          cause: z.treeifyError(validate.error).properties,
        })
        .status(400);
    }

    const user = req.user;
    //todo  remove password from here password can't be updated from here
    const vendorProfile = await Vendor.findByIdAndUpdate(
      user?._id,
      {
        $set: validate.data,
      },
      { new: true }
    );

    return res
      .json({
        success: true,
        message: "Vendor Profile is updated",
        data: vendorProfile,
      })
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

export const addFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validate = FoodInput.safeParse(req.body);

    if (!validate.success) {
      return res
        .json({
          success: false,
          error: "Invalid Inputs",
          cause: z.treeifyError(validate.error),
        })
        .status(400);
    }
    const { foods } = validate.data; 
    const user = req.user;
    const prepareFood = foods.map((food) => ({
      ...food,
      vendorId: user?._id,
    }));

    const newFoods = await Foods.insertMany(prepareFood);
    return res
      .json({ success: true, message: "Food is added", data: newFoods })
      .status(201);
  } catch (error) {
    console.log("Error while adding  the Food ", error);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export const getFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const foods: any = await Vendor.findById(user?._id)
      .populate("foods")
      .lean();
    console.log("foods", foods);
    return res
      .json({
        success: true,
        message: "ALL foods of vender ",
        data: foods?.foods,
      })
      .status(200);
  } catch (error) {
    console.log("Error while getting all the food ", error);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export const acceptOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    if (!orderId || !Types.ObjectId.isValid(orderId)) {
      return res.json({ success: false, error: "Invalid Inputs" }).status(401);
    }
    const user = req.user;
    const orderExist = await Order.findOne({
      _id: orderId,
      vendorId: user?._id,
      orderStatus: "Created",
    });
    if (!orderExist) {
      return res.json({
        success: false,
        error: "Order not exist with this id or already completed",
      });
    }

    orderExist.orderStatus = "Accepted";
    await orderExist.save();

    //todooss create the chatid and then send it via sockets
    return res
      .json({
        success: true,
        message: "Order Accepted Successfully",
        data: orderExist.items,
      })
      .status(200);
  } catch (error) {
    console.log("Something went wrong while accepting the order", error);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export const rejectOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    if (!orderId || !Types.ObjectId.isValid(orderId)) {
      return res.json({ success: false, error: "Invalid Inputs" }).status(401);
    }
    const user = req.user;
    const orderExist = await Order.findOne({
      _id: orderId,
      vendorId: user?._id,
      orderStatus: "Created",
    });

    if (!orderExist) {
      return res.json({
        success: false,
        error: "Order not exist with this id or already completed",
      });
    }

    orderExist.orderStatus = "Rejected";
    await remvoeOrderJob(orderExist.bullJobId as string);
    await orderExist.save();
    //todos send it via socket and notify the user

    return res
      .json({
        success: true,
        message: "Order rejected Successfully",
        data: orderExist.items,
      })
      .status(200);
  } catch (error) {
    console.log("Error while rejecting the order", error);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};
