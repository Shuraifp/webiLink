import { Model, Types } from "mongoose";
import { BaseRepository } from "./baseRepository";
import { IUserPlan } from "../models/UserPlanModel";
import { IUserPlanRepository } from "../interfaces/repositories/IUserplanRepository";

export class UserPlanRepository extends BaseRepository<IUserPlan> implements IUserPlanRepository {
  constructor(private userPlanModel: Model<IUserPlan>) {
    super(userPlanModel);
  }

  async findUserPlan(userId: string): Promise<IUserPlan | null> {
    return await this.userPlanModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
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
}