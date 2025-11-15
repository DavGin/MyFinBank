import axios from 'axios';
import { store } from '../app/store';
import { logout, setAccessToken } from '../features/auth/authSlice';
import {logoutApi, refresh} from "./authApi.ts";
import type {NavigateFunction} from 'react-router-dom';


// Configurazione del client Axios
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;


export async function performLogout(navigate: NavigateFunction): Promise<void> {
    console.log('[PERFORM_LOGOUT] Avvio del logout...');
    try {
        // Notifica il backend del logout
        await logoutApi();
        console.log('[PERFORM_LOGOUT] Logout API completato.');
    } catch (error) {
        console.error('[PERFORM_LOGOUT] Errore durante il logout API:', error);
        // Possiamo comunque continuare con il logout locale anche se il server non risponde correttamente.
    }

    // Esegui il logout locale (stato Redux e localStorage)
    store.dispatch(logout());
    localStorage.clear(); // Rimuove i dati dal localStorage
    console.log('[PERFORM_LOGOUT] Logout locale completato.');

    // Reindirizza l'utente alla pagina di login
    navigate('/auth/login');
    console.log('[PERFORM_LOGOUT] Reindirizzamento completato.');
}



export async function refreshToken(): Promise<string | null> {
    if (isRefreshing) return refreshPromise;
    isRefreshing = true;

    refreshPromise = (async () => {
        try {
            // const token = store.getState().auth.refreshToken ?? ''; // Ottieni l'eventuale refresh token dallo stato
            const response = await refresh();

            if (response.accessToken) {
                store.dispatch(setAccessToken(response.accessToken)); // Aggiorna il token nel Redux store
                return response.accessToken;
            }
            store.dispatch(logout());
            return null;
        } catch {
            store.dispatch(logout());
            return null;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

// Aggiunge l'Authorization Token alle richieste
axiosClient.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.accessToken;
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            }as typeof config.headers;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercetta le risposte per gestire errori 401 (token scaduti)
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest || originalRequest._retryCount >= 2) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

            const newToken = await refreshToken();
            if (newToken) {
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axiosClient(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
