import { BaseRepository } from "./baseRepository";
import { Model } from "mongoose";
import { IPlan } from "../models/PlanModel";
import ISubscriptionRepository from "../interfaces/repositories/subscription.repository";


export class SubscriptionRepository extends BaseRepository<ISubscriptionModel> implements ISubscriptionRepository {
  constructor(private subscriptionModel: Model<ISubscriptionModel>) {
    super(subscriptionModel);
  };
  async addSubscription(data: ISubscription): Promise<ISubscriptionModel> {
    return await this.subscriptionModel.create(data);
  };
};