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
}