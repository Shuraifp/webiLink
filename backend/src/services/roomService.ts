import { Request, Response } from "express";
import { Types } from "mongoose";
import slugify from "slugify";
import { nanoid } from "nanoid";
import RoomRepository from "../repositories/RoomRepository";
import { IRoom } from "../models/mainRoomModel";

class RoomService {
  async createRoom(userId: Types.ObjectId, name: string, isPremiumUser: boolean): Promise<IRoom> {
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        const roomData: Partial<IRoom> = {
          userId,
          name,
          slug,
          isPremiumUser,
          isActive: true,
        };
        const room = await RoomRepository.create(roomData);
        return room;
      } catch (error: any) {
        if (error.code === 11000) {
          slug = `${baseSlug}-${nanoid(6)}`;
          attempts++;
        } else {
          throw error;
        }
      }
    }

    throw new Error("Unable to generate a unique slug after maximum retries");
  }
}

export default new RoomService();