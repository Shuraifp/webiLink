import { IRoom } from "../../types/models";
import { IBaseRepository } from "./IBaseRepository";

export interface IRoomRepository extends IBaseRepository<IRoom> {
  findAllByUserId(userId: string): Promise<IRoom[]>;
  findBySlug(slug: string): Promise<IRoom | null>;
  archiveRoom(slug: string): Promise<IRoom | null>
  archiveExcessRooms(userId: string, keepRoomId?: string): Promise<void>;
  restoreArchivedRooms(userId: string): Promise<void>;
  delete(id: string): Promise<IRoom | null>;
}