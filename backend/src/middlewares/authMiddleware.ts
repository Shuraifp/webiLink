import { Request, Response, NextFunction } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { HttpStatus, JWTPayload } from "../types/type";
import userModel, { IUser } from "../models/userModel";

declare module "express" {
  export interface Request {
    user?: IUser;
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

    jwt.verify(token, secretKey, (err: VerifyErrors | null, decoded: any) => {
      if (err) {
        res.status(HttpStatus.FORBIDDEN).json({ message: "Invalid or expired token" });
        return
      }

      const user = decoded.user as IUser;

      if (user.isBlocked) {
        res.status(HttpStatus.FORBIDDEN).json({ message: `You have been blocked by admin` });
        return
      }

      if (user.role !== requiredRole) {
        res.status(HttpStatus.FORBIDDEN).json({ message: `You do not have prmisn to access this resource` });
        return
      }

      req.user = user;

      console.log('verified')

      next();
    });
  };
};
