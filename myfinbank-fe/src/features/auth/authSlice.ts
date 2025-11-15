// src/features/auth/authSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface User { nome: string; cognome: string; email: string; username: string; ruolo: string; ultimoAccesso: string}
interface AuthState { user: User | null; conti: Conto[] | null; accessToken: string | null; refreshToken: string | null; sessionSecondsLeft: number | null }
interface Conto { id: number; numeroConto: string; iban: string; tipo: string; valuta:string; saldoDisponibile:number; saldoContabile:number; ultimoAggiornamento:string}


const initialState: AuthState = {
    user: null,
    conti: [] as Conto[],
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    sessionSecondsLeft: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials(state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) {
            state.user = action.payload.user
            state.accessToken = action.payload.accessToken
            state.refreshToken = action.payload.refreshToken
            state.user.ruolo = action.payload.user.ruolo
            localStorage.setItem('accessToken', action.payload.accessToken)
            localStorage.setItem('refreshToken', action.payload.refreshToken)
        },
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload
        },
        setConto(state,action:PayloadAction<Conto[]> ){
            state.conti = action.payload
        },
        setAccessToken(state, action: PayloadAction<string>) {
            state.accessToken = action.payload
        },
        setSessionSecondsLeft: (state, action) => {
            state.sessionSecondsLeft = action.payload;
        },
        logout(state) {
            state.user = null
            state.accessToken = null
            localStorage.removeItem('accessToken')
        },
    },
})

export const { setCredentials, setUser, setAccessToken, logout, setSessionSecondsLeft, setConto } = authSlice.actions
export default authSlice.reducer
