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

export const isPremiumUser = async () => {
  try {
    const response = await userApiWithAuth.get("/users/isPremium");
    return response.data;
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

export const getSubscriptionHistory = async (page:number,limit:number) => {
  try {
    const response = await userApiWithAuth.get(`/plans/history`, {params: {page,limit}});
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPendingPlan = async () => {
  try {
    const response = await userApiWithAuth.get(`/plans/pending-plan`);
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

export const cancelPendingSubscription = async () => {
  try {
    const response = await userApiWithAuth.post(`/plans/cancel-pending`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const retryPayment = async () => {
  try {
    const response = await userApiWithAuth.post(`/plans/retry-payment`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};