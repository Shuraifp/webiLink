import { Model, Types } from "mongoose";
import { BaseRepository } from "./baseRepository";
import { IPayment } from "../models/PaymentModel";
import { InternalServerError } from "../utils/errors";
import { IPaymentRepository } from "../interfaces/repositories/IPaymentRepository";


export class PaymentRepository
  extends BaseRepository<IPayment>
  implements IPaymentRepository
{
  constructor(private _paymentModel: Model<IPayment>) {
    super(_paymentModel);
  }

   async create(data: Partial<IPayment>): Promise<IPayment> {
    return await this._paymentModel.create(data);
  }

  async getTotalRevenue(): Promise<number> {
    try {
      const result = await this._paymentModel.aggregate([
        { $match: { status: "succeeded" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      return result[0]?.total || 0;
    } catch (error) {
      throw new InternalServerError(
        `Failed to fetch total revenue: ${(error as Error).message}`
      );
    }
  }

  async getPaymentsByUser(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: IPayment[];
    totalItems: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const query = { userId: new Types.ObjectId(userId) };
      const [data, totalItems] = await Promise.all([
        this._paymentModel
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this._paymentModel.countDocuments(query),
      ]);
      return {
        data,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      };
    } catch (error) {
      throw new InternalServerError(
        `Failed to fetch user payments: ${(error as Error).message}`
      );
    }
  }
}