import type { Request, Response, NextFunction } from "express";
import {
  FoodInput,
  LoginSchema,
  orderStatusInputs,
  vendorInputs,
  VendorServiceInputs,
} from "../dto/index.ts";
import { Vendor, Foods, Order } from "../models/index.ts";
import { GenrateToken, isPassEqual } from "../utility/index.ts";
import z  from "zod";
import { Types } from "mongoose";
import { remvoeOrderJob } from "../queue/order/order.producer.ts";
import { ws } from "../index.ts";
import { ApiError } from "../utility/apiError.ts";

export const vendorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validate = LoginSchema.safeParse(await req.body);
    if (!validate.success) {
      throw new ApiError(400, "Invalid inputs", z.treeifyError(validate.error));
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
  } catch (error:any) {
    console.log("error while login vendor", error);
   return new ApiError(500,error.message, "Internal server Error ")
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
  } catch (error:any) {
    return new ApiError(500,error.message, "Internal server Error ")
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
     throw new ApiError(400, "Invalid inputs", z.treeifyError(validate.error));
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
  } catch (error:any) {
    console.log("Error in update profile routes of vendor ", error);
    return new ApiError(500,error.message, "Internal server Error ")
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
      throw new ApiError(400, "Invalid inputs", z.treeifyError(validate.error));
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
  } catch (error:any) {
    console.log("Error while updating the service ", error);
    return new ApiError(500,error.message, "Internal server Error ")
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
       throw new ApiError(400, "Invalid inputs", z.treeifyError(validate.error));
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
  } catch (error:any) {
    console.log("Error while adding  the Food ", error);
    return new ApiError(500,error.message, "Internal server Error ")
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
  } catch (error:any) {
    console.log("Error while getting all the food ", error);
    return new ApiError(500,error.message, "Internal server Error ")
  }
};

export const acceptOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    if (!orderId || !Types.ObjectId.isValid(orderId)) {
       throw new ApiError(400, "Invalid inputs");
    }
    const user = req.user;
    const orderExist = await Order.findOne({
      _id: orderId,
      orderStatus: "Created",
    });  
    console.log("order",orderExist)
    if (!orderExist) {
      return res.json({
        success: false,
        error: "Order not exist with this id or already completed",
      }).status(404);
    }

    orderExist.orderStatus = "Accepted";
    orderExist.chatId = orderExist?._id as string;
    await orderExist.save();
    //todooss create the chatid and then send it via sockets   
      await remvoeOrderJob(orderExist.bullJobId as string);  
     ws.sendToUser(orderExist.userId,{orderId:orderExist._id,orderStatus:orderExist.orderStatus,chatId:orderExist.chatId});
   console.log(orderExist)
    return res
      .json({
        success: true,
        message: "Order Accepted Successfully",
        data: orderExist.items,
      })
      .status(200);
  } catch (error:any) {
    console.log("Something went wrong while accepting the order", error);
    return new ApiError(500,error.message, "Internal server Error ")
  }
};

export const rejectOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    if (!orderId || !Types.ObjectId.isValid(orderId)) {
      throw new ApiError(400, "Invalid inputs");
    }
    const user = req.user;
    const orderExist = await Order.findOne({
      _id: orderId,
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

    if (orderExist.chatId) {
      await ws.clearChatRoom(orderExist.chatId);
      orderExist.chatId = null;
    }

    await orderExist.save();
    const orderDetails = {
      orderId: orderExist._id,
      name: user?.name,
      orderStaus: orderExist.orderStatus,
      price: orderExist.totalAmount,
    };
    ws.sendToUser(orderExist.userId, orderDetails);
    return res
      .json({
        success: true,
        message: "Order rejected Successfully",
        data: orderExist.items,
      })
      .status(200);
  } catch (error:any) {
    console.log("Error while rejecting the order", error);
    return new ApiError(500,error.message, "Internal server Error ")
  }
};

export const orderStatusTrack = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId || !Types.ObjectId.isValid(orderId)) {
      throw new ApiError(400, "Invalid inputs");
    }

    const validate = orderStatusInputs.safeParse(req.body);

    if (!validate.success) {
      return res
        .json({
          success: false,
          error: "Invalid Inputs",
          cause: z.treeifyError(validate.error),
        })
        .status(401);
    }

    const orderExist = await Order.findOne({
      _id: orderId,
      orderStatus: "Accepted",
    });
    if (!orderExist) {
      return res.json({
        success: false,
        error: "Order not exist with this id or already completed",
      });
    }
    orderExist.orderStatus = validate.data.orderStatus;
    await orderExist.save();
    const orderDetails = {
      orderId: orderExist._id,
      orderStaus: orderExist.orderStatus,
    };
    ws.sendToUser(orderExist.userId, orderDetails);   
    return res.json({success:true,message:"Order status Updated"}).status(201);
  } catch (error:any) {
   return new ApiError(500,error.message, "Internal server Error ")
  }
};
