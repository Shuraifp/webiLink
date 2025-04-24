import { Types } from "mongoose";
import slugify from "slugify";
import { IRoomRepository } from "../interfaces/repositories/IRoomRepository";
import { IRoom } from "../models/mainRoomModel";
import { IRoomService } from "../interfaces/services/IRoomService";
import { BadRequestError, InternalServerError, NotFoundError } from "../utils/errors";

export class RoomService implements IRoomService {
  constructor(private _roomRepository: IRoomRepository) {}

  async generateId() : Promise<string> {
    const { nanoid } = await import('nanoid');
    return nanoid(6)
  }

  async createRoom(
    userId: Types.ObjectId,
    name: string,
    isPremiumUser: boolean = false
  ): Promise<IRoom> {
    let baseSlug = slugify(name, { lower: true, strict: true });
    if (!baseSlug) {
      throw new BadRequestError("Unable to generate slug from room name");
    }
    let slug = baseSlug;
    console.log(slug);
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        const roomData: Partial<IRoom> = {
          userId,
          name,
          slug,
          isPremiumUser,
        };
        const room = await this._roomRepository.create(roomData);
        if (!room) {
          throw new InternalServerError("Failed to create a room");
        }
        return room;
      } catch (error: any) {
        if (error.code === 11000) {
          slug = `${baseSlug}-${this.generateId()}`;
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
  }

  async getAllRooms(userId:string): Promise<IRoom[]> {
      try {
        const rooms = await this._roomRepository.findAll(userId);
        return rooms;
      } catch (err:any) {
        throw new InternalServerError(
          err.message || "Unexpected error while fetching rooms"
        );
      }
  }

  async getRoom(roomId: string): Promise<IRoom> {
    const room = await this._roomRepository.findBySlug(roomId);
    if (!room) throw new NotFoundError('Room not found');
    return room;
  }
}
