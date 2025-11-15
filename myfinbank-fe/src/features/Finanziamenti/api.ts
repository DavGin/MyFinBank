import axiosClient from '../../api/axiosClient'

export type Finanziamento = {
    id:number;
    numeroPratica: string;
    importoRichiesto: number,
    importoTotale: number,
    durataMesi: number,
    tassoInteresse: number,
    dataCreazione: string,
    dataChiusura: string,
    motivoFinanziamento: string,
    stato: string,
    motivoRifiuto: string
}

export type CreateFinanziamentoInput = {
    id: number
    importo: number
    durataMesi: number
    tassoInteresse: number
}

export async function fetchListaFinanziamenti(): Promise<Finanziamento[]> {
    console.log('Fetching finanziamenti...')
    const res = await axiosClient.get('/v1/finanziamenti/listFinanziamentiUtente')
    return res.data
}

export async function createFinanziamento(data: CreateFinanziamentoInput): Promise<Finanziamento> {
    const res = await axiosClient.post('/v1/finanziamenti/createFinanziamento', data)
    return res.data
}

export async function fetchFinanziamentoDetail(numeroPratica: string): Promise<Finanziamento> {
    const res = await axiosClient.get(`/v1/finanziamenti/getFinanziamento/${numeroPratica}`)
    return res.data
}

export type SimulationInput = {
    importo: number
    durataMesi: number
    tassoInteresse: number
    motivo: string
}

export type SimulationRow = {
    numeroRata:number;
    scadenza:string;
    quotaCapitale:number;
    interessi:number;
    rataTotale:number;
    saldoRimanente:number;
    statoRata:string;
}

export async function simulateFin(data: SimulationInput): Promise<SimulationRow[]> {
    const res = await axiosClient.post('/v1/finanziamenti/simulatoreFinanziamento', data)
    return res.data
}

export interface Rata {
    numeroRata: number
    quotaCapitale: number
    interessi: number
    rataTotale: number
    saldoRimanente: number
    scadenza: string
    statoRata: 'PAGATO' | 'SCADUTO' | 'DA_PAGARE' | "IN_ATTESA"
}

export async function calcolaRata(numeroPratica: string): Promise<Rata[]> {
    const res = await axiosClient.get(`/v1/finanziamenti/calcolaRata/${numeroPratica}`)
    return res.data
}
export interface PagaRataDto {
    numeroPratica: string;
    numeroRata:string;
    numeroConto:string;
    numeroCarta:string;
    scadenzaCarta:string
    CVV:string
}
export async function pagaRata(data: PagaRataDto): Promise<void> {
    await axiosClient.post(`/v1/finanziamenti/pagaRata`, data)
}

export async function fetchRateByNumeroPratica(numeroPratica: string): Promise<Rata[]> {
    const res = await axiosClient.get(`/v1/finanziamenti/findByNumeroPratica/${numeroPratica}`);
    return res.data;
}

export interface FinanziamentoRequestDto {
    numeroPratica: string
    importoRichiesto: number
    importoTotale:number
    durataMesi: number
    tassoInteresse: number
    stato: string
    motivoFinanziamento?: string
    dataCreazione: string
    dataChiusura:string
    motivoRifiuto:string
    userId: number
}

export async function getFinanziamento(numeroPratica: string): Promise<FinanziamentoRequestDto> {
    const res = await axiosClient.get(`/v1/finanziamenti/getFinanziamento/${numeroPratica}`)
    return res.data
}

