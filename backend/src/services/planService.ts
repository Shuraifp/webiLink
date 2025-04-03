import { IPlanRepository } from "../interfaces/IPlanRepository";
import { IPlanService } from "../interfaces/IPlanService";
import { IPlan } from "../models/PlanModel";
import { NotFoundError } from "../utils/errors";


export class PlanService implements IPlanService {
  constructor(
    private _planRepository: IPlanRepository
  ) {}

  async listActivePlans(): Promise<IPlan[]> {
      const plans = await this._planRepository.listActivePlans()
      if (!plans || plans.length === 0) throw new NotFoundError("No active plans found");
      return plans
  }
}