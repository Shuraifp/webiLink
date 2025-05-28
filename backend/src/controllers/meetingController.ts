import { Request, Response, NextFunction } from "express";
import { HttpStatus, successResponse } from "../types/type";
import { IMeetingService } from "../interfaces/services/IMeetingService";
import { BadRequestError, UnauthorizedError } from "../utils/errors";

export class MeetingController {
  constructor(private _meetingService: IMeetingService) {}

  async getUserMeetings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = req.user?._id;
      if (!userId) {
        throw new UnauthorizedError("Invalid or missing user ID");
      }
      const data = await this._meetingService.getUserMeetings(userId,page,limit);
      res.status(HttpStatus.OK).json(successResponse("Meetings fetched successfully", data));
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