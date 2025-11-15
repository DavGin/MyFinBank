import axiosClient from "./axiosClient.ts";


export type ResponseData = {
    username?: string
    accessToken?: string
    access_token?: string
    token?: string
    refreshToken?: string
    refresh_token?: string
    user?: { username: string; email: string}
}

type FormData = { identifier: string; password: string; }

export async function login(data: FormData): Promise<ResponseData> {
    console.log('Effettuando login con:', data);
    const res = await axiosClient.post('/auth/login', data); // Assicura che `ResponseData` sia specificato
    return res.data;
}
export async function refresh(): Promise<ResponseData> {
    try {
        const res = await axiosClient.post(`/auth/refresh`, {}, { withCredentials: true });
        return res.data; // Restituisci i dati della risposta
    } catch (error) {
        console.error('Errore durante il refresh del token:', error);
        throw error;
    }
}

export type Registrazione = {
    email: string;
    password: string;
    nome: string;
    cognome: string;
    codiceFiscale: string;
    dataNascita?: string; // Campo opzionale
    username?: string;    //
    telefono?: string;
}

export async function registrazione(data: Registrazione): Promise<Registrazione> {
    console.log('Effettuando la registrazione con :', data);
    const res = await axiosClient.post('/auth/register', data); // Assicura che `ResponseData` sia specificato
    return res.data;
}

export async function logoutApi(): Promise<void> {
    const res = await axiosClient.post('/auth/logout');
    return res.data
}

