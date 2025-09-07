import { Plan } from "@/types/plan";
import { adminApiWithAuth } from "../axios";



export const createPlan = async (planData: Plan) => {
  try {
    const res = await adminApiWithAuth.post(`/plans`, planData);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getPlans = async () => {
  try {
    const res = await adminApiWithAuth.get(`/plans/active-plans`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getArchivedPlans = async () => {
  try {
    const res = await adminApiWithAuth.get(`/plans/archived-plans`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const archivePlan = async (id: string) => {
  try {
    const res = await adminApiWithAuth.patch(`/plans/${id}/archive`);
    return res.data.data;
  } catch (err) {
    throw err;
  }
};

export const restorePlan = async (id: string) => {
  try {
    const res = await adminApiWithAuth.patch(`/plans/${id}/restore`);
    return res.data.data;
  } catch (err) {
    throw err;
  }
};

export const editPlan = async (data: Plan) => {
  try {
    const res = await adminApiWithAuth.put(`/plans/${data.id}`, data);
    console.log(res.data);
    return res.data.data;
  } catch (err) {
    throw err;
  }
};
