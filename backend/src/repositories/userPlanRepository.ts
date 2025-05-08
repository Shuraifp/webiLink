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
}