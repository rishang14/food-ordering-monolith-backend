import type { NextFunction, Request, Response } from "express";
import { CreateCustomerSchema } from "../dto/Customer.dto.js";
import z  from "zod";
import { Customer } from "../models/User.models.js";
import {
  checkotpExpiry,
  generateOtpAndExpiry,
  GenrateToken,
  HashPassword,
  isPassEqual,
} from "../utility/index.js";
import { addjob } from "../queue/email.producer.js";
import { LoginSchema } from "../dto/Vendor.dto.ts";
import { fa } from "zod/locales";

export const CreateCustomer = async (req: Request, res: Response) => {
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
    await addjob({
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

export const LoginCustomer = async (req: Request, res: Response) => {
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

    const user = await Customer.findOne({ email: data.email });

    if (user) {
      const checkpass = isPassEqual(data.password, user.password);

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
      });
    }

    const user = req.user;

    const customer = await Customer.findById({ _id: user?._id });

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
