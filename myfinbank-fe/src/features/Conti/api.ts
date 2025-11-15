import axiosClient from '../../api/axiosClient'

export type ContoDto = {
    id: number
    numeroConto: string
    iban: string
    tipo: string
    valuta:string
    saldoDisponibile:number
    saldoContabile:number
    ultimoAggiornamento:string
}

export async function fetchListaConti(): Promise<ContoDto[]> {
    try {
        console.log('Fetching conti...')
        const res = await axiosClient.get('/conti/listaConti')
        console.log('Fetch conti successful', res.data.ultimoAggiornamento)
        return res.data
    } catch (error) {
        console.log('Error fetching conti', error)
        throw error
    }
}

export type CreateContoInput = {
    id: number
    numeroConto: string,
    tipo: string,
    iban: string,
    valuta: string,
    saldoContabile: number
    saldoDisponibile: number
}

export async function createConto(data: CreateContoInput): Promise<ContoDto> {
    try {
        console.log('Creating conto with data:', data)
        const res = await axiosClient.post('/conti/createConto', data)
        console.log('Create conto successful', res.data)
        return res.data
    } catch (error) {
        console.log('Error creating conto', error)
        throw error
    }
}

export async function chiudiConto(numeroConto: string): Promise<void> {
    await axiosClient.get(`/conti/chiudiConto/${numeroConto}`);
}
