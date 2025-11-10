import type { NextFunction, Request, Response } from "express";
import { VerifyToken, type userPayload, type VendorPaylaod } from "../utility/index.js";
4;


declare global {
  namespace Express {
    interface Request {
      user?: VendorPaylaod | userPayload;
    }
  }
}

export const Auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tken = req.cookies.token;

    if (!tken) {
      return res
        .json({
          success: false,
          error: "Pls provide the token ",
        })
        .status(401);
    }

    const { success, token } = await VerifyToken(tken);

    if (!success || token === null) {
      return res
        .json({ error: "Pls send the valid token", success: false })
        .status(401);
    }
    if (token) {
      req.user = token as VendorPaylaod | userPayload;
    }

    next();
  } catch (error) {
    return res.json({ error: "Internal Server Error" }).status(500);
  }
};
