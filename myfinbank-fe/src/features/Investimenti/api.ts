import axiosClient from '../../api/axiosClient'
import type { Rendimento } from "../../pages/Investimenti/InvestimentoRendimentoPage"

export type Investimento = {
    id:number;
    identificativo: string;
    tipoInvestimento:string;
    importoInvestito:number;
    tassoRitornoPrevisto:number;
    statoInvestimento: string;
    dataInizio: string;
    dataFine:string;
    mesi:number;
    importoTotale:number
}

export type CreateInvestimentoInput = {
    numeroConto: string
    tipoInvestimento: string
    importoInvestito: number
    tassoRitornoPrevisto: number
    durataMesi: number
    simboloMercato: string
}

// export type SimulazioneInvestimentoOutputDto = {
//     id:number;
//     identificativo: string;
//     tipoInvestimento:string;
//     importoInvestito:number;
//     tassoRitornoPrevisto:number;
//     statoInvestimento: string;
//     dataInizio: string;
//     dataFine:string;
//     mesi:number;
//     importoTotale:number
// }

export async function fetchInvestimenti(): Promise<Investimento[]> {
    const res = await axiosClient.get('/v1/investimento/getUserInvestments')
    return res.data
}

export async function createInvestimento(data: CreateInvestimentoInput): Promise<Investimento> {
    const response = await axiosClient.post<Investimento>(
        '/v1/investimento/createInvestimento',
        {
            numeroConto: data.numeroConto,
            tipoInvestimento: data.tipoInvestimento,
            importoInvestito: data.importoInvestito,
            tassoRitornoPrevisto: data.tassoRitornoPrevisto,
            durataMesi: data.durataMesi,
            simboloMercato: data.simboloMercato,
        },
        { withCredentials: true }
    )
    return response.data
}

export async function fetchInvestimentoById(identificativo: string, mesi:string): Promise<Investimento> {
    const res = await axiosClient.get(`/v1/investimento/proiezioneInvestimento/${identificativo}/${mesi}`)
    return res.data
}

export async function closeInvestimento(identificativo: string): Promise<Investimento> {
    const res = await axiosClient.post(`/v1/investimento/chiudiInvestimento/${identificativo}`)
    return res.data
}

export type SimulationInvestimentoInput = {
    importoIniziale: number
    mesi: number
    tassoPrevisto: number

}

export type SimulazioneInvestimentoOutputDto = {
    importoIniziale: number;
    tassoPrevisto: number;
    mesi: number;
    importoFinale:number;
}

export async function simulateInvestimento(data: SimulationInvestimentoInput): Promise<SimulazioneInvestimentoOutputDto> {
    const res = await axiosClient.post('/v1/investimento/simulaInvestimento', data)
    return res.data
}

export const rendimentoInvestimento = async (identificativo: string): Promise<Rendimento[]> => {
    const res = await axiosClient.get(`/v1/investimento/${identificativo}/rendimenti`);
    return res.data;
};


export interface MarketData {
    symbol: string;
    date: string;
    open: number;
    close: number;
}

export async function getMarketData(symbol: string): Promise<MarketData[]> {
    const res = await axiosClient.get(`/v1/investimento/market-data/${symbol}`);
    return res.data;
}


export async function getSupportedSymbols(): Promise<string[]> {
    const res = await axiosClient.get(`/v1/investimento/market-data/symbols`);
    return res.data;
}
