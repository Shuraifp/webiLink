import { Model, PipelineStage, Types } from "mongoose";
import { BaseRepository } from "./baseRepository";
import { InternalServerError } from "../utils/errors";
import { IPaymentRepository } from "../interfaces/repositories/IPaymentRepository";
import logger from "../utils/logger";
import { PopulatedPayment } from "../mappers/paymentMapper";
import { IPayment } from "../types/models";

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

  async getRecentTransactions(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: PopulatedPayment[];
    totalItems: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const query = { status: "succeeded" };
      const [rdata, totalItems] = await Promise.all([
        this._paymentModel
          .find(query)
          .populate<{ userId: { username: string } }>("userId", "username")
          .populate<{ planId: { name: string } }>("planId", "name")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this._paymentModel.countDocuments(query),
      ]);
      
      const data: PopulatedPayment[] = rdata.map((payment) => ({
        ...payment,
        userId: payment.userId ? { username: payment.userId.username } : { username: "Unknown" },
        planId: payment.planId ? { name: payment.planId.name } : { name: "Unknown" },
      }));
      
      return {
        data,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      };
    } catch (error) {
      logger.error("Error fetching recent transactions:", error);
      throw new InternalServerError(
        `Failed to fetch recent transactions: ${(error as Error).message}`
      );
    }
  }

  async getRevenueData(
    filter?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ labels: (string | number)[]; totalPrices: number[] }> {
    const currentYear = new Date().getFullYear();
    const pipeline: PipelineStage[] = [];

    try {
      if (filter === "Yearly") {
        pipeline.push(
          {
            $match: {
              status: "succeeded",
            },
          },
          {
            $project: {
              year: { $year: "$createdAt" },
              totalPrice: "$amount",
            },
          },
          {
            $group: {
              _id: "$year",
              totalPrice: { $sum: "$totalPrice" },
            },
          },
          { $sort: { _id: 1 } }
        );
      } else if (filter === "Monthly") {
        pipeline.push(
          {
            $match: {
              createdAt: {
                $gte: new Date(currentYear, 0, 1),
                $lt: new Date(currentYear + 1, 0, 1),
              },
              status: "succeeded",
            },
          },
          {
            $project: {
              month: { $month: "$createdAt" },
              totalPrice: "$amount",
            },
          },
          {
            $group: {
              _id: "$month",
              totalPrice: { $sum: "$totalPrice" },
            },
          },
          { $sort: { _id: 1 } }
        );
      } else if (filter === "Weekly") {
        pipeline.push(
          {
            $match: {
              status: "succeeded",
            },
          },
          {
            $project: {
              week: { $isoWeek: "$createdAt" },
              totalPrice: "$amount",
            },
          },
          {
            $group: {
              _id: "$week",
              totalPrice: { $sum: "$totalPrice" },
            },
          },
          { $sort: { _id: 1 } }
        );
      } else if (filter === "Custom" && startDate && endDate) {
        pipeline.push(
          {
            $match: {
              createdAt: {
                $gte: startDate,
                $lte: endDate,
              },
              status: "succeeded",
            },
          },
          {
            $project: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
              totalPrice: "$amount",
            },
          },
          {
            $group: {
              _id: { year: "$year", month: "$month", day: "$day" },
              totalPrice: { $sum: "$totalPrice" },
            },
          },
          {
            $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
          },
        );
      }

      const payments = await this._paymentModel.aggregate(pipeline);

      const labels = [];
      const totalPrices = [];

      if (filter === "Yearly") {
        const years = [currentYear - 2, currentYear - 1, currentYear];
        const salesData = years.map((year) => {
          const pay = payments.find((order) => order._id === year);
          return pay ? pay.totalPrice : 0;
        });

        labels.push(...years);
        totalPrices.push(...salesData);
      } else if (filter === "Monthly") {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const monthlyData = new Array(12).fill(0);

        payments.forEach((pay) => {
          monthlyData[pay._id - 1] = pay.totalPrice;
        });

        labels.push(...months);
        totalPrices.push(...monthlyData);
      } else if (filter === "Weekly") {
        const date = new Date();
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
        const nearestThursday = new Date(date);
        nearestThursday.setDate(date.getDate() + (4 - dayOfWeek));
        const yearStart = new Date(nearestThursday.getFullYear(), 0, 1);
        const daysDifference = Math.floor(
          (nearestThursday.getTime() - yearStart.getTime()) /
            (24 * 60 * 60 * 1000)
        );
        const weekNumber = Math.floor((daysDifference + 10) / 7);

        const weeks = [
          weekNumber === 1
            ? 50
            : weekNumber === 2
            ? 51
            : weekNumber === 3
            ? 52
            : weekNumber - 3,
          weekNumber === 1 ? 51 : weekNumber === 2 ? 52 : weekNumber - 2,
          weekNumber === 1 ? 52 : weekNumber - 1,
          weekNumber,
          weekNumber === 52 ? 1 : weekNumber + 1,
        ];

        const weeklyData = weeks.map((week) => {
          const payment = payments.find((p) => p._id === week);
          return payment ? payment.totalPrice : 0;
        });

        labels.push(...weeks);
        totalPrices.push(...weeklyData);
      } else if (filter === "Custom" && startDate && endDate) {
        payments.forEach((pay) => {
          const date = new Date(pay._id.year, pay._id.month - 1, pay._id.day);
          labels.push(date.toLocaleDateString());
          totalPrices.push(pay.totalPrice || 0);
        });
        if (labels.length === 0 && startDate && endDate) {
          labels.push(
            `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
          );
          totalPrices.push(0);
        }
      }

      return { labels, totalPrices };
    } catch (error) {
      logger.error("Error fetching revenue data:", error);
      throw new InternalServerError(
        `Failed to fetch revenue data: ${(error as Error).message}`
      );
    }
  }
}
