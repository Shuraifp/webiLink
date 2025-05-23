import { Request, Response, NextFunction } from "express";
import { HttpStatus, successResponse } from "../types/type";
import { IMeetingService } from "../interfaces/services/IMeetingService";
import { BadRequestError, UnauthorizedError } from "../utils/errors";

export class MeetingController {
  constructor(private _meetingService: IMeetingService) {}

  async getUserMeetings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new UnauthorizedError("Invalid or missing user ID");
      }
      const meetings = await this._meetingService.getUserMeetings(userId);
      res.status(HttpStatus.OK).json(successResponse("Meetings fetched successfully", meetings));
    } catch (error) {
      next(error);
    }
  }

  async getMeetingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { meetingId } = req.params;
      if (!meetingId) {
        throw new BadRequestError("Meeting ID is required");
      }
      const meeting = await this._meetingService.getMeetingById(meetingId);
      res.status(HttpStatus.OK).json(successResponse("Meeting fetched successfully", meeting));
    } catch (error) {
      next(error);
    }
  }
}