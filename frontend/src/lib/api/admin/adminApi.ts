import { Plan } from "@/app/(dashboard)/admin/plans/page";
import { adminApiWithAuth } from "../axios";
import { UserStatus } from "@/app/(dashboard)/admin/users/page";

export const fetchUsers = async () => {
  try {
    const res = await adminApiWithAuth.get('/admin/users');
    return res.data.data.map((user: {_id:string,username:string,email:string,isBlocked:boolean,isArchived:boolean}) => ({
      ...user,
      status: user.isBlocked ? UserStatus.Blocked : user.isArchived ? UserStatus.Archived : UserStatus.Active,
    }));
  } catch (err) {
    throw err
  }
}

export const blockUser = async (id:string) => {
  try {
    const res = await adminApiWithAuth.put(`/admin/users/${id}/block`);
    return res.data
  } catch (err) {
    throw err
  }
}

export const unblockUser = async (id:string) => {
  try {
    const res = await adminApiWithAuth.put(`/admin/users/${id}/unblock`);
    return res.data
  } catch (err) {
    throw err
  }
}

export const softDeleteUser = async (id: string) => {
  try {
    const res = await adminApiWithAuth.put(`/admin/users/${id}/archive`);
    return res.data;
  } catch (err) {
    throw err;
  }
};


export const restoreUser = async (id: string) => {
  try {
    const res = await adminApiWithAuth.put(`/admin/users/${id}/restore`);
    return res.data;
  } catch (err) {
    throw err;
  }
};


//    plans

export const createPlan = async (data : Plan) => {
  try {
    const res = await adminApiWithAuth.post(`/admin/plans`, data);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getPlans = async () => {
  try {
    const res = await adminApiWithAuth.get(`/admin/plans`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getArchivedPlans = async () => {
  try {
    const res = await adminApiWithAuth.get(`/admin/archived-plans`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const archivePlan = async (id:string) => {
  try {
    const res = await adminApiWithAuth.patch(`/admin/plans/${id}/archive`);
    return res.data.data;
  } catch (err) {
    throw err;
  }
};

export const restorePlan = async (id:string) => {
  try {
    const res = await adminApiWithAuth.patch(`/admin/plans/${id}/restore`);
    return res.data.data;
  } catch (err) {
    throw err;
  }
};

export const editPlan = async (data : Plan) => {
  try {
    const res = await adminApiWithAuth.put(`/admin/plans/${data._id}`, data);
    console.log(res.data)
    return res.data.data;
  } catch (err) {
    throw err;
  }
};
