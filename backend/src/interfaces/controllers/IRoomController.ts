import { Request, Response, NextFunction } from "express";

export interface IRoomController {
  createRoom(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllRooms(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateRoom(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteRoom(req: Request, res: Response, next: NextFunction): Promise<void>;
  getRoomById(req: Request, res: Response, next: NextFunction): Promise<void>;
  getRoomByName(req: Request, res: Response, next: NextFunction): Promise<void>;
}