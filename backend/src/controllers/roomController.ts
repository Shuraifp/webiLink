import { NextFunction, Request, Response } from 'express';
import { HttpStatus, successResponse } from '../types/type';
import { IRoomService } from '../interfaces/services/IRoomService';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import { Types } from 'mongoose';


export class RoomController {
  constructor(
    private _roomService: IRoomService
  ) {}

  async getAllRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId || !Types.ObjectId.isValid(userId)) {
        throw new UnauthorizedError("Invalid or missing user ID.");
      }
      const rooms = await this._roomService.getAllRooms(userId)
      res.status(HttpStatus.OK).json(successResponse('Rooms fetched successfully', rooms));
    } catch (error) {
      next(error);
    }
  }

  async createRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name } = req.body;
      const userId = req.user?._id;
      if(!name) throw new BadRequestError('room name is required');
      const room = await this._roomService.createRoom(userId!,name)
      res.status(HttpStatus.CREATED).json(successResponse('Room created successfully', room));
    } catch (error) {
      next(error);
    }
  }

  async updateRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Logic to update a room
      res.status(HttpStatus.OK).json(successResponse('Room updated successfully', {}));
    } catch (error) {
      next(error);
    }
  }

  async deleteRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Logic to delete a room
      res.status(HttpStatus.OK).json(successResponse('Room deleted successfully', {}));
    } catch (error) {
      next(error);
    }
  }

  async getRoomById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Logic to fetch a room by ID
      res.status(HttpStatus.OK).json(successResponse('Room fetched successfully', {}));
    } catch (error) {
      next(error);
    }
  }

  async getRoomByName(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Logic to fetch a room by name
      res.status(HttpStatus.OK).json(successResponse('Room fetched successfully', {}));
    } catch (error) {
      next(error);
    }
  }
}