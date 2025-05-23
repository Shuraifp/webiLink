import { IUserService } from "../interfaces/services/IUserService";
import { ResponseUser } from "../types/responses";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { NotFoundError, InternalServerError } from "../utils/errors";
import { IUser } from "../models/userModel";
import { DashboardStatsDTO } from "../dto/userDTO";
import { IMeetingRepository } from "../interfaces/repositories/IMeetingRepository";
import { MeetingMapper } from "../mappers/meetingMapper";

export class UserService implements IUserService {
  constructor(
    private _userRepository: IUserRepository,
    private _meetingRepository: IMeetingRepository
  ) {}

  private toResponseUser(user: IUser): ResponseUser {
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      profile: user.profile
        ? {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            avatar: user.profile.avatar,
            backgroundImage: user.profile.backgroundImage,
            bio: user.profile.bio,
            jobTitle: user.profile.jobTitle,
            company: user.profile.company,
          }
        : undefined,
      isPremium: user.isPremium,
      planId: user.planId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUserById(userId: string): Promise<ResponseUser> {
    const user = await this._userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return this.toResponseUser(user);
  }

  async updateUserProfile(
    userId: string,
    profileData: Partial<ResponseUser["profile"]>
  ): Promise<ResponseUser> {
    const user = await this._userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const updatedUser = await this._userRepository.update(userId, {
      profile: { ...user.profile, ...profileData },
    });
    if (!updatedUser)
      throw new InternalServerError("Failed to update user profile");

    return this.toResponseUser(updatedUser);
  }

  async getUserByEmail(email: string): Promise<ResponseUser | null> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) throw new NotFoundError("User not found");
    return this.toResponseUser(user);
  }

  async isPremiumUser(userId: string): Promise<boolean> {
    const user = await this._userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user.isPremium;
  }

  async getDashboardStats(userId: string): Promise<DashboardStatsDTO> {
    try {
      const user = await this._userRepository.findById(userId);
      if (!user) throw new NotFoundError("User not found");

      const meetings = await this._meetingRepository.findByUserId(userId);
      const meetingDTOs = MeetingMapper.toMeetingHistoryDTOList(
        meetings,
        userId
      );

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats: DashboardStatsDTO = {
        totalMeetings: meetingDTOs.length,
        hostedMeetings: meetingDTOs.filter((m) => m.type === "hosted").length,
        attendedMeetings: meetingDTOs.filter((m) => m.type === "attended")
          .length,
        totalDuration: meetingDTOs.reduce((sum, m) => sum + m.duration, 0),
        totalParticipants: meetingDTOs.reduce(
          (sum, m) => sum + m.participants,
          0
        ),
        avgMeetingDuration: meetingDTOs.length
          ? Math.round(
              meetingDTOs.reduce((sum, m) => sum + m.duration, 0) /
                meetingDTOs.length
            )
          : 0,
        thisWeekMeetings: meetingDTOs.filter(
          (m) => new Date(m.date) >= oneWeekAgo
        ).length,
        thisMonthMeetings: meetingDTOs.filter(
          (m) => new Date(m.date) >= oneMonthAgo
        ).length,
        recentActivity: meetingDTOs
          .filter((m) => m.status === "completed")
          .slice(0, 4)
          .map((m) => ({
            id: m.id,
            roomName: m.roomName,
            duration: m.duration,
            participants: m.participants,
            date: m.date,
            status: m.status,
            type: m.type,
            hostName: m.hostName,
          })),
      };

      return stats;
    } catch (error) {
      throw error instanceof NotFoundError
        ? error
        : new InternalServerError(
            "An error occurred while fetching dashboard stats"
          );
    }
  }
}
