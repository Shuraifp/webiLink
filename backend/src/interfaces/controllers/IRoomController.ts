import { Request, Response } from "express";

export interface IRoomController {
  createRoom(req: Request, res: Response): Promise<void>;
  getAllRooms(req: Request, res: Response): Promise<void>;
  updateRoom(req: Request, res: Response): Promise<void>;
  deleteRoom(req: Request, res: Response): Promise<void>;
  getRoomById(req: Request, res: Response): Promise<void>;
  getRoomByName(req: Request, res: Response): Promise<void>;
}