import { Types } from "mongoose";
import slugify from "slugify";
import { IRoomRepository } from "../interfaces/repositories/IRoomRepository";
import { IRoom } from "../models/RoomModel";
import { IRoomService } from "../interfaces/services/IRoomService";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import logger from "../utils/logger";

export class RoomService implements IRoomService {
  constructor(
    private _roomRepository: IRoomRepository,
    private _userRepository?: IUserRepository
  ) {}

  async generateId(): Promise<string> {
    const { nanoid } = await import("nanoid");
    return nanoid(6);
  }

  async createRoom(userId: string, name: string): Promise<IRoom> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestError("Invalid user ID");
      }

      const user = await this._userRepository!.findById(userId);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      if (!user.isPremium) {
        const roomCount = await this._roomRepository.findAllByUserId(userId);
        if (roomCount.length >= 1) {
          throw new BadRequestError(
            "Non-premium users can only create one room"
          );
        }
      }

      let baseSlug = slugify(name, { lower: true, strict: true });
      if (!baseSlug) {
        throw new BadRequestError("Unable to generate slug from room name");
      }
      let slug = baseSlug;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        try {
          const roomData: Partial<IRoom> = {
            userId: new Types.ObjectId(userId),
            name,
            slug,
            isPremiumUser: user.isPremium,
          };
          const room = await this._roomRepository.create(roomData);
          if (!room) {
            throw new InternalServerError("Failed to create a room");
          }
          return room;
        } catch (error: any) {
          if (error.code === 11000) {
            slug = `${baseSlug}-${await this.generateId()}`;
            attempts++;
          } else if (error instanceof BadRequestError) {
            throw error;
          } else {
            throw new InternalServerError(
              error.message || "Unexpected error while creating room"
            );
          }
        }
      }

      throw new InternalServerError(
        "Unable to generate a unique slug after maximum retries"
      );
    } catch (error) {
      throw error instanceof BadRequestError || error instanceof NotFoundError
        ? error
        : new InternalServerError("An error occurred while creating the room");
    }
  }

  async getAllRooms(userId: string): Promise<IRoom[]> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestError("Invalid user ID");
      }
      const rooms = await this._roomRepository.findAllByUserId(userId);
      return rooms;
    } catch (err: any) {
      throw new InternalServerError(
        err.message || "Unexpected error while fetching rooms"
      );
    }
  }

  async getRoom(roomId: string): Promise<IRoom> {
    const room = await this._roomRepository.findBySlug(roomId);
    if (!room) throw new NotFoundError("Room not found");
    return room;
  }

  async deleteRoom(userId: string, roomId: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(roomId)) {
        throw new BadRequestError("Invalid user ID or room ID");
      }
      const room = await this._roomRepository.findById(roomId);
      if (!room) throw new NotFoundError("Room not found");
      if (room.userId.toString() !== userId) {
        throw new UnauthorizedError("You are not authorized to delete this room");
      }
      await this._roomRepository.delete(roomId);
    } catch (error) {
      throw error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof UnauthorizedError
        ? error
        : new InternalServerError("Failed to delete room");
    }
  }

  async archiveExcessRooms(userId: string, keepRoomId?: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestError("Invalid user ID");
      }
      await this._roomRepository.archiveExcessRooms(userId, keepRoomId);
    } catch (error) {
      logger.error("Error archiving excess rooms:", error);
      throw new InternalServerError("Failed to archive excess rooms");
    }
  }

  async restoreArchivedRooms(userId: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestError("Invalid user ID");
      }
      const user = await this._userRepository!.findById(userId);
      if (!user) {
        throw new NotFoundError("User not found");
      }
      if (!user.isPremium) {
        throw new BadRequestError("Only premium users can restore rooms");
      }
      await this._roomRepository.restoreArchivedRooms(userId);
    } catch (error) {
      logger.error("Error restoring archived rooms:", error);
      throw error instanceof BadRequestError || error instanceof NotFoundError
        ? error
        : new InternalServerError("Failed to restore archived rooms");
    }
  }
}