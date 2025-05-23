import { IMeeting } from "../../models/MeetingModel";

export interface IMeetingRepository {
  create(data: Partial<IMeeting>): Promise<IMeeting>;
  findById(id: string): Promise<IMeeting | null>;
  update(id: string, data: Partial<IMeeting>): Promise<IMeeting | null>;
  findByQuery(query: object): Promise<IMeeting | null>;
  findAll(): Promise<IMeeting[]>;
  findByRoomId(roomId: string): Promise<IMeeting[]>;
  findByUserId(userId: string): Promise<IMeeting[]>;
  findOngoingByRoomId(roomId: string): Promise<IMeeting | null>;
}