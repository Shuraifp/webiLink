import { Model, Types } from "mongoose";
import { BaseRepository } from "./baseRepository";
import { IUserPlanRepository } from "../interfaces/repositories/IUserplanRepository";
import { InternalServerError } from "../utils/errors";
import { IUserPlan, PlanStatus } from "../types/models";

export class UserPlanRepository
  extends BaseRepository<IUserPlan>
  implements IUserPlanRepository
{
  constructor(private userPlanModel: Model<IUserPlan>) {
    super(userPlanModel);
  }

  async findAllByQuery(query: any): Promise<IUserPlan[]> {
    return await this.userPlanModel.find(query).lean();
  }

  async findUserPlan(userId: string): Promise<IUserPlan | null> {
    return await this.userPlanModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  async listUserPlans(query: any, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, totalItems] = await Promise.all([
      this.userPlanModel.find(query).skip(skip).limit(limit).lean(),
      this.userPlanModel.countDocuments(query),
    ]);
    return {
      data,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async countDocuments(query: any): Promise<number> {
    return await this.userPlanModel.countDocuments(query);
  }

  async getHistory(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: IUserPlan[];
    totalItems: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const [data, totalItems] = await Promise.all([
        this.userPlanModel
          .find({ userId: new Types.ObjectId(userId) })
          .populate({
            path: "planId",
            select: "name price billingCycle features",
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.userPlanModel.countDocuments({
          userId: new Types.ObjectId(userId),
        }),
      ]);
      return {
        data,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      };
    } catch (error) {
      throw new InternalServerError(
        `Failed to fetch subscription history: ${(error as Error).message}`
      );
    }
  }

  async getSubscriptionCounts(): Promise<
    { planId: string; planName: string; count: number }[]
  > {
    try {
      const result = await this.userPlanModel.aggregate([
        { $match: { status: PlanStatus.ACTIVE } },
        {
          $group: {
            _id: "$planId",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "plans",
            localField: "_id",
            foreignField: "_id",
            as: "plan",
          },
        },
        { $unwind: "$plan" },
        {
          $project: {
            planId: "$_id",
            planName: "$plan.name",
            count: 1,
          },
        },
      ]);
      return result;
    } catch (error) {
      throw new InternalServerError(
        `Failed to fetch subscription counts: ${(error as Error).message}`
      );
    }
  }
}
