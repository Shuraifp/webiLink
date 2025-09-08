import { TransactionDTO } from "../dto/transactionDTO";
import { IPayment } from "../types/models";

export interface PopulatedPayment extends Omit<IPayment, "userId" | "planId"> {
  userId: { username: string };
  planId: { name: string };
}

export class PaymentMapper {
  static toTransactionDTO(payment: PopulatedPayment): TransactionDTO {
    return {
      transactionId: `TXN-${payment.serialNumber}-${payment._id.toString().slice(-6)}`,
      username: payment.userId.username || "Unknown",
      planname: payment.planId.name || "Unknown",
      amount: payment.amount,
      date: payment.createdAt.toISOString().split("T")[0],
    };
  }

  static toTransactionDTOList(payments: PopulatedPayment[]): TransactionDTO[] {
    return payments.map((payment) => this.toTransactionDTO(payment));
  }
}