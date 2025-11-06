import type { NextFunction, Request, Response } from "express";
import { VerifyToken } from "../utility/index.js";
4;

interface AuthPayload {
  _id: string;
  name: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
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
      req.user = token as AuthPayload;
    }

    next();
  } catch (error) {
    return res.json({ error: "Internal Server Error" }).status(500);
  }
};
