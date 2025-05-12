import axios from "axios"

const options = {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
    timeout: 10000,
}

const API = axios.create(options);

export const APIRefresh = axios.create(options);
APIRefresh.interceptors.response.use((response) => response);

API.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const { data, status } = error.response;
        
        // Eğer token bulunamadı ve 401 hatası varsa
        if (data.errorCode === "AUTH_TOKEN_NOT_FOUND" && status === 401) {
            try {
                await APIRefresh.get("/auth/refresh");
                return APIRefresh(error.config);
            } catch (refreshError) {
                return Promise.reject({
                    message: "Your session has expired. Please login again.",
                    errorCode: "SESSION_EXPIRED",
                    ...data
                });
            }
        }
        return Promise.reject({
            ...data,
        });
    }
);
export default API;