import { apiWithoutAuth } from "../axios";
import { userApiWithAuth } from "../axios";

export const getPlans = async () => {
  try {
    const res = await apiWithoutAuth.get(`/plans`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const subscribeToPlan = async ({
  planId,
  priceId,
}: {
  planId: string;
  priceId: string;
}) => {
  try {
    const response = await userApiWithAuth.post("/plans/create-subscription", {
      planId,
      priceId,
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getUserPlan = async () => {
  try {
    const response = await userApiWithAuth.get(`/plans/user-plan`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelSubscription = async () => {
  try {
    const response = await userApiWithAuth.post(
      `/plans/cancel-subscription`,
      {}
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
