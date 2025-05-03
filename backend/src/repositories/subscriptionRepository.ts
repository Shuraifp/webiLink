import { BaseRepository } from "./base.repository";
import TYPES from "../di/types";
import { Model } from "mongoose";
import { ISubscription, ISubscriptionModel } from "../types/user";
import ISubscriptionRepository from "../interfaces/repositories/subscription.repository";


export class SubscriptionRepository extends BaseRepository<ISubscriptionModel> implements ISubscriptionRepository {
  constructor(private subscriptionModel: Model<ISubscriptionModel>) {
    super(subscriptionModel);
  };
  async addSubscription(data: ISubscription): Promise<ISubscriptionModel> {
    return await this.subscriptionModel.create(data);
  };
};