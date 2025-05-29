import { PopulatedPayment } from "../../mappers/paymentMapper";
import { IPayment } from "../../models/PaymentModel";
import { IBaseRepository } from "./IBaseRepository";

export interface IPaymentRepository extends IBaseRepository<IPayment> {
  getTotalRevenue(): Promise<number>;
  getPaymentsByUser(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<{
    data: IPayment[];
    totalItems: number;
    totalPages: number;
  }>;
  getRecentTransactions(
    page: number,
    limit: number
  ): Promise<{
    data: PopulatedPayment[];
    totalItems: number;
    totalPages: number;
  }>;
  getRevenueData(
    filter?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ labels: (string | number)[]; totalPrices: number[] }>;
}
