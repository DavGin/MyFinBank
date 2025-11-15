import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Alert, Card, CardContent, Typography } from '@mui/material'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { rendimentoInvestimento } from '../../features/Investimenti/api'

export type Rendimento = {
    periodo: string
    valoreIniziale: number
    rendimentoMaturato: number
    valoreAttuale: number
}

export default function InvestimentoRendimentiPage() {
    const { identificativo } = useParams<{ identificativo: string }>()

    const { data, isLoading, isError } = useQuery<Rendimento[]>({
        queryKey: ['rendimenti', identificativo],
        queryFn: async () => {
            if (!identificativo) throw new Error('Identificativo mancante!')
            const res = await rendimentoInvestimento(identificativo)
            if (!res) throw new Error('Nessun dato restituito!')
            return res
        },
    })

    if (isLoading) return <p>Caricamento rendimenti...</p>
    if (isError || !data)
        return (
            <Alert severity="error">
                Errore nel caricamento dei rendimenti o dati non disponibili
            </Alert>
        )

    const columns: GridColDef[] = [
        { field: 'periodo', headerName: 'Periodo', width: 150 },
        { field: 'valoreIniziale', headerName: 'Valore Iniziale (€)', width: 200 },
        { field: 'rendimentoMaturato', headerName: 'Rendimento (€)', width: 200 },
        { field: 'valoreAttuale', headerName: 'Valore Attuale (€)', width: 200 },
    ]

    return (
        <Card className="w-full p-4 mt-4">
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Storico Rendimenti — ID: {identificativo}
                </Typography>

                <div style={{ height: 400, width: '100%', marginBottom: '2rem' }}>
                    <DataGrid
                        rows={(data ?? []).map((d, i) => ({ id: i, ...d }))}
                        columns={columns}
                        disableRowSelectionOnClick
                    />
                </div>

                <Typography variant="h6" gutterBottom>
                    Andamento Valore Attuale
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="periodo" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="valoreAttuale" stroke="#1976d2" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
