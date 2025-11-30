import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post(`${API_URL}/token/refresh/`, {
                    refresh: refreshToken
                });
                
                const { access } = response.data;
                localStorage.setItem('access_token', access);
                
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

// API methods
export const moviesAPI = {
    
    getAll: (params) => api.get('/movies/movies/', { params }),
    getById: (id) => api.get(`/movies/movies/${id}/`),
    
    
    getNowShowing: () => api.get('/movies/movies/'),
    
    
    getShowtimes: (movieId, params) => api.get(`/movies/movies/${movieId}/showtimes/`, { params }),
};

export const cinemasAPI = {
    
    getAll: () => api.get('/movies/cinemas/'),
    getById: (id) => api.get(`/movies/cinemas/${id}/`),
};

export const showtimesAPI = {
    
    getById: (id) => api.get(`/movies/showtimes/${id}/`),
    getSeats: (id) => api.get(`/movies/showtimes/${id}/seats/`),
};

export const bookingsAPI = {
    
    create: (data) => api.post('/bookings/bookings/', data),
    getMyBookings: () => api.get('/bookings/bookings/'),
    getById: (id) => api.get(`/bookings/bookings/${id}/`),
    cancel: (id) => api.post(`/bookings/bookings/${id}/cancel/`),
    processPayment: (id, data) => api.post(`/bookings/bookings/${id}/process_payment/`, data),
};

export const authAPI = {
    login: (credentials) => api.post('/token/', credentials),
    register: (userData) => api.post('/users/register/', userData),
    getProfile: () => api.get('/users/profile/'),
    updateProfile: (data) => api.put('/users/profile/', data),
    forgotPassword: (email) => api.post('/users/forgot-password/', { email }),
    resetPassword: (uid, token, password) => api.post('/users/reset-password/', { 
        uid, 
        token, 
        password 
    }),
    verifyResetToken: (uid, token) => api.get(`/users/reset-password/${uid}/${token}/`),
};

export default api;
