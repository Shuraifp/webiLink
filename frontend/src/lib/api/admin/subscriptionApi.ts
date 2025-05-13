import { adminApiWithAuth } from "../axios";


export const fetchSubscriptions = async ({
  page,
  limit,
  search,
  status,
}: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) => {
  const response = await adminApiWithAuth.get("/plans/subscriptions", {
    params: { page, limit, search, status },
  });
  return response.data.data;
};

// export const cancelSubscription = async (subscriptionId: string) => {
//   const response = await adminApiWithAuth.post(`/plans/${subscriptionId}/cancel`);
//   return response.data.data;
// };