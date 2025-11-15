import axiosClient from '../../api/axiosClient'
import type {TransazioneDto} from "../transazioni/api.ts";
import type {JSX} from "react/jsx-runtime";

export type CartaDto = {

    id: number
    numeroCarta: string;
    numeroConto: string;
    cvc:string;
    dataScadenza:string;
    circuito:string;
    tipo: string;
    limiteGiornaliero:string;
    limiteMensile:string;
    dataCreazione:string;
    saldoCarta:string;
    plafond:string;
    stato:string;
    ultimoUtilizzo:string;
    pin:string;

}
export type CartaRequest = {
    numeroConto: string
    tipo: string
}

export async function aggiungiCarta(data: CartaRequest): Promise<CartaDto> {
    try {
        console.log('Creating carta with data:', data)
        const res = await axiosClient.post('/carte/aggiungiCarta', data)
        console.log('Create carta successful', res.data)
        return res.data
    } catch (error) {
        console.log('Error creating carta', error)
        throw error
    }
}

export async function listaCarte(): Promise<CartaDto[]> {
    try {
        console.log('Fetching carte...')
        const res = await axiosClient.get('/carte/listaCarte')
        console.log('Fetch conti successful', res.data.ultimoAggiornamento)
        return res.data
    } catch (error) {
        console.log('Error fetching conti', error)
        throw error
    }
}

export async function dettaglioCarta( id : string): Promise<CartaDto> {
    try {
        console.log('Fetching dettaglio carte...')
        const res = await axiosClient.get(`/carte/findCartaById/${id}`)
        console.log('Fetch dettaglio carta successful', res.data.ultimoAggiornamento)
        return res.data
    } catch (error) {
        console.log('Error fetching dettaglio carta', error)
        throw error
    }
}

export interface PaginatedTransazioniDto {
    length: number;
    map(arg0: (op: any) => JSX.Element): import("react").ReactNode;
    content: TransazioneDto[];
    totalElements: number;
    totalPages: number;
    number: number; // pagina corrente
}

export async function fetchTransazioniByCarta(
    numeroCarta: string,
    pagina: number,
    size: number
): Promise<PaginatedTransazioniDto> {
    try {
        const res = await axiosClient.get(`/v1/transazioni/listTransazioniCarta/${numeroCarta}`, {
            params: { page: pagina, size }
        });
        console.log("data ---> ", res.data)
        return res.data;
    } catch (error) {
        console.error("Errore durante il fetch delle transazioni:", error);
        throw error;
    }
}

export async function bloccaCarta( id : string): Promise<CartaDto> {
    try {
        console.log('Fetching blocca carta...')
        const res = await axiosClient.get(`/carte/bloccaCarta/${id}`)
        console.log('Fetch blocca carta successful', res.data.ultimoAggiornamento)
        return res.data
    } catch (error) {
        console.log('Error fetching blocca carta', error)
        throw error
    }
}

export async function modificaCarta( data: Partial<CartaDto> & { id: number }): Promise<CartaDto> {
    try {
        console.log('Fetching blocca carta...')
        const res = await axiosClient.post(`/carte/modificaCarta/${data.id}`, data)
        console.log('Fetch blocca carta successful', res.data)
        return res.data
    } catch (error) {
        console.log('Error fetching blocca carta', error)
        throw error
    }
}

export async function sbloccaCarta( id : string, pin: string): Promise<CartaDto> {
    try {
        console.log('Fetching blocca carta...')
        const res = await axiosClient.get(`/carte/bloccaCarta/${id}/${pin}`)
        console.log('Fetch blocca carta successful', res.data.ultimoAggiornamento)
        return res.data
    } catch (error) {
        console.log('Error fetching blocca carta', error)
        throw error
    }
}