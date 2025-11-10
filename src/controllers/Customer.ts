import type { NextFunction, Request, Response } from "express";
import { CreateCustomerSchema } from "../dto/Customer.dto.js";
import z, { success } from "zod";
import { Customer } from "../models/User.models.js";
import { generateOtpAndExpiry, HashPassword } from "../utility/index.js";
import { addjob } from "../queue/email.producer.js";

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
    const haspass =await HashPassword(data.password);
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
    console.log(otp,"otp"); 
    console.log(expiry,"expiry"); 
    console.log(haspass,"hashedpass");
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
