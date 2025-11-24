import type { Request, Response } from "express";
import {
  addtoCartSchema,
  CreateCustomerSchema,
  editCustomerInputs,
} from "../dto/Customer.dto.js";
import z from "zod";
import { Customer, Order, type OrderDoc } from "../models/index.ts";
import {
  checkotpExpiry,
  generateOtpAndExpiry,
  GenrateToken,
  HashPassword,
  isPassEqual,
} from "../utility/index.ts";
import { addEmailJob } from "../queue/email.producer.ts";
import { addOrderjob } from "../queue/order.producer.ts";
import { Customercart } from "../services/user/Cart.service.ts";
import { CreateOrderSchema, LoginSchema } from "../dto/index.ts";
import { CustomerOrder } from "../services/user/Customer.order.ts";
import type { Job } from "bullmq";
import { ws } from "../index.ts";

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const validate = CreateCustomerSchema.safeParse(req.body);

    if (!validate.success) {
      return res
        .json({
          success: false,
          error: "Invalid Validation",
          cause: z.treeifyError(validate.error),
        })
        .status(400);
    }

    const { data } = validate;
    // otp and expiry is created
    const { otp, expiry } = generateOtpAndExpiry();
    // password is hashed
    const haspass = await HashPassword(data.password);
    // user is saved in the db and now

    const userExisT = await Customer.findOne({ email: data.email });

    if (userExisT) {
      return res
        .json({ success: false, error: "User already exists with this email" })
        .status(409);
    }

    const user = await Customer.create({
      name: data.name,
      email: data.email,
      address: data.address,
      verified: false,
      phone: data.phone,
      otp: otp,
      otp_expiry: expiry,
      password: haspass,
    });

    // now add this to the queue
    console.log(otp, "otp");
    console.log(expiry, "expiry");
    console.log(haspass, "hashedpass");
    await addEmailJob({
      type: "sendOtpMail",
      param: { otp, name: data.name, email: data.email },
    });

    return res
      .json({
        success: true,
        message: "User Created Successefully",
        data: user,
      })
      .status(201);
  } catch (error) {
    console.log("Error while creating the customer", error);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export const loginCustomer = async (req: Request, res: Response) => {
  try {
    const validate = LoginSchema.safeParse(req.body);

    if (!validate.success) {
      return res
        .json({
          success: false,
          error: "Invalid Inputs",
          cause: z.treeifyError(validate.error),
        })
        .status(400);
    }

    const { data } = validate;

    const user = await Customer.findOne({ email: data.email }).select(
      "+password -otp -otp_expiry"
    );

    if (user) {
      const checkpass = await isPassEqual(data.password, user.password);

      if (!checkpass) {
        return res
          .json({ success: false, error: "Invalid Credentials" })
          .status(401);
      }

      const token = await GenrateToken({
        name: user.name,
        email: user.email,
        _id: user._id as string,
        isVerified: user.verified,
      });
      res.cookie("token", token, {
        maxAge: 3600000,
        httpOnly: true,
        secure: true,
      });
      return res
        .json({ success: true, message: "Logged in Successfully", data: user })
        .status(200);
    }
    return res
      .json({ success: false, error: "User not found with this email" })
      .status(404);
  } catch (error) {
    console.log("error while creating the user", error);
    return res
      .json({ success: false, error: "Interanl Server Error" })
      .status(500);
  }
};

export const otpVerify = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    if (isNaN(otp) || Number(otp) < 10000) {
      return res.json({
        success: false,
        error: "Invalid Input",
        cause: "NAN  or Invalid otp format",
      }).status;
    }

    const user = req.user;

    const customer = await Customer.findById({ _id: user?._id }).select(
      "+otp  +otp_expiry"
    );
    if (customer) {
      const otpInTime = checkotpExpiry(customer.otp_expiry as Date);

      if (!otpInTime) {
        (customer.otp = undefined), (customer.otp_expiry = undefined);
        await customer?.save();

        return res
          .json({ success: false, error: "Otp is Expired" })
          .status(401);
      }

      if (otp !== customer.otp) {
        return res.json({ success: false, error: "Incorrect Otp" }).status(403);
      }

      (customer.otp = undefined), (customer.otp_expiry = undefined);
      customer.verified = true;

      const token = await GenrateToken({
        _id: customer._id as string,
        email: customer.email,
        isVerified: true,
        name: customer.name,
      });

      res.cookie("token", token, {
        maxAge: 3600000,
        httpOnly: true,
        secure: true,
      });

      return res
        .json({ success: true, message: "Otp Verified Successfully" })
        .status(200);
    }

    return res
      .json({ success: false, error: "Unauthenticated req" })
      .status(401);
  } catch (error) {
    console.log("error while verifying otp", error);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export const getCustomerProfile = async (req: Request, res: Response) => {
  try {
    const cookieUser = req.user;
    if (cookieUser?._id) {
      const userData = await Customer.findById({ _id: cookieUser?._id }).lean();
      return res
        .json({ success: true, message: "User Detailed Here", data: userData })
        .status(200);
    }
    return res.json({ success: false, error: "Nothing Found" }).status(404);
  } catch (error) {
    console.log("Error while sending the data", error);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export const updateCustomerProfile = async (req: Request, res: Response) => {
  try {
    const validate = editCustomerInputs.safeParse(req.body);

    if (!validate.success) {
      return res
        .json({
          success: false,
          error: "Invalid Inputs",
          cause: z.treeifyError(validate.error),
        })
        .status(400);
    }
    const user = req.user;

    //todo  remove password from here password can't be updated from here
    const updatedUser = await Customer.findByIdAndUpdate(
      user?._id,
      { $set: validate.data },
      { new: true }
    );
    console.log("updated user", updatedUser);
    return res
      .json({
        success: true,
        message: "User Updated Successfully",
        data: updatedUser,
      })
      .status(200);
  } catch (error) {
    console.log("Error while updating the user", error);
    return res
      .json({ success: false, error: "Internal Server Error" })
      .status(500);
  }
};

export const addFoodItemTocart = async (req: Request, res: Response) => {
  try {
    const validate = addtoCartSchema.safeParse(req.body);
    if (!validate.success) {
      return res
        .json({
          success: false,
          error: "Invalid Inputs",
          cause: z.treeifyError(validate.error),
        })
        .status(400);
    }
    const user = req.user;

    const { foodId, unit } = validate.data;

    const cart = await Customercart.addtocart({
      userId: user?._id as string,
      foodId,
      unit,
    });

    return res
      .json({
        success: true,
        message: "Added to cart successfully",
        data: cart,
      })
      .status(200);
  } catch (error: any) {
    console.log("Error while addig item to the cart", error);

    return res
      .json({
        success: false,
        error: error.message || "Internal Server Error",
      })
      .status(500);
  }
};

export const removeFromTheCart = async (req: Request, res: Response) => {
  try {
    const { foodId } = req.params;

    if (!foodId) {
      return res.json({ success: false, error: "Invalid request" }).status(400);
    }
    const user = req.user;

    const carItem = await Customercart.removeFromCart({
      userId: user?._id as string,
      foodId,
    });

    return res.json({
      success: true,
      message: "Item removed successfully",
      data: carItem,
    });
  } catch (error: any) {
    console.log("error while updating the cart", error);
    return res
      .json({ success: false, error: error.message || "Internal Server Error" })
      .status(500);
  }
};

export const emptyUserCart = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    console.log("i am trigerred");
    const cart = await Customercart.clearCart({ userId: user?._id as string });
    return res
      .json({ success: true, message: "Cart is empty now" })
      .status(200);
  } catch (error: any) {
    console.log("Error while claering the cart");

    return res
      .json({ success: false, error: error.message || "Intenal Server Error" })
      .status(500);
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const validate = CreateOrderSchema.safeParse(req.body);

    if (!validate.success) {
      return res
        .json({
          success: false,
          error: "Invalid Inputs",
          cause: z.treeifyError(validate.error),
        })
        .status(400);
    }

    const user = req.user;

    if (validate.data.userId !== user?._id) {
      return res
        .json({ success: false, error: "Pls provide valid id of the user" })
        .status(401);
    }

    const order: any = await CustomerOrder.generateOrder(validate.data);

    const userOrderdetails = {
      items: order.items,
      price: order.totalAmount,
      orderStatus: order.orderStatus,
      vendorId: order.vendorId,
      createdAt: order.cancelledAt,
    };
    
    const vendorOrderDetail={
      item:order.item,
      price:order.totalAmount,
      user:user.name 
    }


    const job = await addOrderjob({
      type: "authoCancelOrder",
      param: {
        vendorId: order.vendorId,
        userId: user._id,
        orderId: order?._id.toString() as string,
      },
    });

    await Order.findByIdAndUpdate(order._id, {
      bullJobId: job.id,
    });

    // todo notify the vendor imppediaterly
    ws.sendToVendor(order.vendorId,vendorOrderDetail);

    return res
      .json({
        success: true,
        message: "Order Created Successfully wait for restaurant to accept",
        data: userOrderdetails,
      })
      .status(201);
  } catch (error: any) {
    console.log("Error while creating the order");
    return res
      .json({ success: false, error: error.message || "Internal Server Error" })
      .status(500);
  }
};
