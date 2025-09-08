import { IMeeting } from "../../types/models";

export interface IMeetingRepository {
  create(data: Partial<IMeeting>): Promise<IMeeting>;
  findById(id: string): Promise<IMeeting | null>;
  update(id: string, data: Partial<IMeeting>): Promise<IMeeting | null>;
  findByQuery(query: object): Promise<IMeeting | null>;
  findAll(): Promise<IMeeting[]>;
  findByRoomId(roomId: string): Promise<IMeeting[]>;
  findByUserId(userId: string): Promise<IMeeting[]>;
  listByUserId(userId: string,page:number,limit:number): Promise<{meetings:IMeeting[],totalPages:number}>
  findOngoingByRoomId(roomId: string): Promise<IMeeting | null>;
  getUniqueParticipantsCountAndDuration(): Promise<{
    totalMeetings: number;
    totalParticipants: number;
    totalDuration: number;
  }>;
}