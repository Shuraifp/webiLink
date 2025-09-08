import { PlanDTO } from "../dto/planDTO";
import { IPlan } from "../types/models";

export class PlanMapper {
  static toPlanDTO(plan: IPlan): PlanDTO {
    return {
      id: plan._id!.toString(),
      name: plan.name,
      description: plan.description || undefined,
      price: plan.price,
      billingCycle: plan.billingCycle,
      features: plan.features,
      isArchived: plan.isArchived,
      stripePriceId: plan.stripePriceId,
      createdAt: plan.createdAt!.toISOString(),
    };
  }

  static toPlanDTOList(plans: IPlan[]): PlanDTO[] {
    return plans.map(plan => this.toPlanDTO(plan));
  }
}