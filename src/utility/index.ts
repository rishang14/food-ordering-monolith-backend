import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface VendorPaylaod {
  name: string;
  email: string;
  _id: string;
}

export interface userPayload extends VendorPaylaod {
  isVerified: boolean;
}

export const HashPassword = async (password: string) => {
  const pass = await bcrypt.hash(password, 10);

  return pass;
};

export const isPassEqual = async (password: string, hashPassword: string) => {
  console.log(password, "password");
  console.log(hashPassword, "hashpassword");
  return await bcrypt.compare(password, hashPassword);
};

export const GenrateToken = async (payload: VendorPaylaod | userPayload) => {
  const token = await jwt.sign(payload, process.env.SECRET!, {
    expiresIn: "1D",
  });
  return token;
};

export const VerifyToken = async (token: string) => {
  try {
    const verified = await jwt.verify(token, process.env.SECRET!);
    console.log(verified);
    return { success: true, token: verified };
  } catch (error) {
    return { success: false, token: null };
  }
};

export const generateOtpAndExpiry = () => {
  const currtime = new Date();
  

  const expiry = new Date(currtime.getTime() + 30 * 60 * 1000);

  return { otp: Math.floor(100000 + Math.random() * 900000), expiry:expiry.toISOString() };
};

export const checkotpExpiry = (expiry:Date) => {
  const now = new Date();
  const expiryTime = new Date(expiry);
  return now < expiryTime;
};
