import { IPlan } from "../models/PlanModel";


export interface IPlanService {
  listActivePlans(): Promise<IPlan[]>;
}