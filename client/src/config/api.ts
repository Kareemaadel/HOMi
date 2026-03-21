import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create axios instance with default configuration
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Error codes that are business-logic 401s — NOT token expiration.
// These should never trigger a token refresh or logout.
const BUSINESS_LOGIC_401_CODES = new Set([
    'INVALID_CURRENT_PASSWORD',
    'INVALID_CREDENTIALS',
    'NOT_AUTHENTICATED',   // user intentionally not logged in (handled by caller)
]);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const errorCode: string | undefined = error.response?.data?.code;

        // Only attempt token refresh for real token-expiry 401s.
        // Business-logic 401s (wrong password, etc.) pass straight through.
        const isTokenError =
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !BUSINESS_LOGIC_401_CODES.has(errorCode ?? '');

        if (isTokenError) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    // Try to refresh the token
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken } = response.data;
                    localStorage.setItem('accessToken', accessToken);

                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed — clear session and redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('profile');
                globalThis.location.href = '/auth';
                throw refreshError;
            }
        }

        throw error;
    }
);

export default apiClient;
