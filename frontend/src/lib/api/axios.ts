import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiWithoutAuth = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

const createAuthApi = (refreshEndpoint:string) => {
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
                console.log('refreshing...')

                try {
                    await refreshToken(refreshEndpoint);
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

export const adminApiWithAuth = createAuthApi('/auth/refresh-adminToken');
export const userApiWithAuth = createAuthApi('/auth/refresh-userToken');

const refreshToken = async (refreshEndpoint:string) => {
    try {
        await axios.post(`${BASE_URL}${refreshEndpoint}`, {}, { withCredentials: true });
        console.log("Token refreshed successfully");
    } catch (error) {
        console.error("Token refresh failed", error);
        throw error;
    }
};
