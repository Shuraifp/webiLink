import { NextFunction, Request, Response } from 'express';
import { IRoomController } from '../interfaces/controllers/IRoomController';
import { HttpStatus, successResponse } from '../types/type';


export class RoomController implements IRoomController {
  async getAllRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Logic to fetch all rooms
      res.status(HttpStatus.OK).json(successResponse('Rooms fetched successfully', []));
    } catch (error) {
      next(error);
    }
  }

  async createRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Logic to create a new room
      res.status(HttpStatus.CREATED).json(successResponse('Room created successfully', {}));
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