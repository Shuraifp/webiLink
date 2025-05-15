import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../types/type";
import userModel from "../models/userModel";
import logger from "../utils/logger";

export const restrictToPremium = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?._id as string;
    if (!userId) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: "User not authenticated" });
      return;
    }

    const user = await userModel.findById(userId).select("isPremium");
    if (!user) {
      res.status(HttpStatus.NOT_FOUND).json({ message: "User not found" });
      return;
    }

    if (!user.isPremium) {
      res.status(HttpStatus.FORBIDDEN).json({ message: "Premium subscription required" });
      return;
    }

    next();
  } catch (error) {
    logger.error(error)
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
};