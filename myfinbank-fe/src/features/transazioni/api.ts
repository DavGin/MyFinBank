import type { JSX } from "react/jsx-runtime";
import axiosClient from "../../api/axiosClient.ts";
import type {ContoDto} from "../Conti/api.ts";

export type Transazioni = {
    id: number;
    importo: number;
    tipoTransazione: string
    descrizione: string;
    dataTransazione: string;
    dataContabile: string;
    direzione: string;
    stato: string;
};

export async function fetchConto(numeroConto: string): Promise<ContoDto> {
    try {
        const res = await axiosClient.get(`/conti/findByNumeroConto/${numeroConto}`);
        return res.data;
    } catch (error) {
        console.error("Errore durante il fetch del conto:", error);
        throw error;
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

export async function fetchTransazioniByConto(
    numeroConto: string,
    pagina: number,
    size: number
): Promise<PaginatedTransazioniDto> {
    try {
        const res = await axiosClient.get(`/v1/transazioni/listTransazioni/${numeroConto}`, {
            params: { page: pagina, size }
        });
        console.log("data ---> ", res.data)
        return res.data;
    } catch (error) {
        console.error("Errore durante il fetch delle transazioni:", error);
        throw error;
    }
}

export type CreateTransactionInput = {
    id: number
    importo: number
    descrizione: string
    data: string
    tipoTransazione: string
    valuta: string,
    dataTransazione: string,
    numeroConto: string,
    targetIban: string
}


export async function createTransazione(data: CreateTransactionInput): Promise<Transazioni> {
    try {
        console.log("Creazione transazione con data:", data);
        const res = await axiosClient.post(`/v1/transazioni/creaTransazione`, data)
        return res.data
    } catch (error) {
        console.error("Errore durante il fetch delle transazioni:", error);
        throw error;

    }
}

export type TransazioneDto = {
    id: number
    tipoTransazione: string
    importo: number
    valuta: string
    categoria:string
    dataTransazione:string
    dataContabile:string
    descrizione:string
    numeroConto: string
    numeroCarta: string
    targetIban: string
    direzione: string
    stato:string
}

export async function fetchDettaglioTransazione(id: number): Promise<TransazioneDto> {
    try {
    console.log("Cerca transazione con id :", id);
    const res = await axiosClient.get(`/v1/transazioni/dettaglioTransazione/${id}`);
        console.log("---> ", res.data.dataContabile)
        return res.data
    } catch (error) {
        console.error("Errore durante il fetch delle transazioni:", error);
        throw error;

    }
}

