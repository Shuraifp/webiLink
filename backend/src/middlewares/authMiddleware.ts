import { Request, Response, NextFunction } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { HttpStatus, JWTPayload } from "../types/type";
import userModel from "../models/userModel";

declare module "express" {
  export interface Request {
    user?: JWTPayload;
  }
}

export const authenticateJWT = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) : void => {
    
    let token: string | undefined;
    
    if (requiredRole === "admin") {
      token = req.cookies.adminAccessToken;
    } else if (requiredRole === "user") {
      token = req.cookies.accessToken;
    }

    if (!token) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: `${requiredRole} token is required` });
      return
    }

    const secretKey = process.env.JWT_SECRET ? process.env.JWT_SECRET : "secret";

    jwt.verify(token, secretKey, async (err: VerifyErrors | null, decoded: any) => {
      if (err) {
        res.status(HttpStatus.FORBIDDEN).json({ message: "Invalid or expired token" });
        return
      }

      const user = decoded as JWTPayload;

      const dbUser = await userModel.findById(user._id).select("isBlocked");

      if (!dbUser) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: "User not found" });
        return
      }
      if (dbUser.isBlocked) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: "User is blocked" });
        return
      }
      if (user.role !== requiredRole) {
        res.status(HttpStatus.FORBIDDEN).json({ message: `You do not have permission to access this resource` });
        return
      }

      req.user = user;

      next();
    });
  };
};
