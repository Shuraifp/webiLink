import Room, { IRoom } from "../models/mainRoomModel";

class RoomRepository {
  async create(roomData: Partial<IRoom>): Promise<IRoom> {
    const room = new Room(roomData);
    return await room.save();
  }

  async findBySlug(slug: string): Promise<IRoom | null> {
    return await Room.findOne({ slug });
  }
}

export default new RoomRepository();