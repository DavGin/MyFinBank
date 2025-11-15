// src/features/profile/api.ts
import axiosClient from '../../api/axiosClient'

export type Profile = {
    username : string;
    email: string;
    nome: string;
    cognome: string;
    codiceFiscale: string
    dataNascita: string;
    isAdmin: boolean;
    password: string;
    ruolo: string;
    ultimoAccesso: string;
}

export async function getProfile(): Promise<Profile> {
    const res = await axiosClient.get('/v1/profile/profile')
    return res.data
}

export async function updateProfile(data: Partial<Profile>): Promise<Profile> {
    const res = await axiosClient.post('/v1/profile/updateProfile', data)
    return res.data
}
export async function updatePassword(data: { oldPassword: string; newPassword: string }): Promise<void> {
    await axiosClient.post('/v1/profile/updatePassword', data)
}
