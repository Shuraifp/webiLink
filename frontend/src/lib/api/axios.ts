import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiWithoutAuth = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

const createAuthApi = () => {
    const instance = axios.create({
        baseURL: BASE_URL,
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
    });

    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    await refreshToken();
                    return axios(originalRequest);
                } catch (refreshError) {
                    return Promise.reject(refreshError);
                }
            }

            return Promise.reject(error);
        }
    );

    return instance;
};

export const adminApiWithAuth = createAuthApi();
export const userApiWithAuth = createAuthApi();

const refreshToken = async () => {
    try {
        await axios.post(`${BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
        console.log("Token refreshed successfully");
    } catch (error) {
        console.error("Token refresh failed", error);
        throw error;
    }
};
