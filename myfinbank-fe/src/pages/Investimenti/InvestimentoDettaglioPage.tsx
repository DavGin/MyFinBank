import { useQuery } from '@tanstack/react-query'
import { Box, Grid, Paper, Typography, CircularProgress, Alert, Table, TableHead, TableRow, TableCell, TableBody, TableContainer } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import {fetchInvestimenti, type Investimento} from "../../features/Investimenti/api.ts";


const COLORS = ['#1976d2', '#9c27b0', '#2e7d32', '#ed6c02']

export default function InvestimentoDettaglioPage() {
    const { data: investimenti, isLoading, isError } = useQuery<Investimento[]>({
        queryKey: ['investimenti'],
        queryFn: fetchInvestimenti,
    })

    if (isLoading) return <CircularProgress />
    if (isError || !investimenti) return <Alert severity="error">Errore nel caricamento dei dati</Alert>

    // Calcoli riepilogo
    const totaleInvestito = investimenti.reduce((sum, inv) => sum + inv.importoInvestito, 0)
    const rendimentoTotale = investimenti.reduce((sum, inv) => sum + (inv.importoInvestito * inv.tassoRitornoPrevisto) / 100, 0)
    const attivi = investimenti.filter(inv => inv.statoInvestimento === 'ACTIVE').length

    // Dati grafico lineare (andamento nel tempo)
    const lineData = investimenti.map(inv => ({
        name: inv.identificativo,
        rendimento: ((inv.importoInvestito * inv.tassoRitornoPrevisto) / 100).toFixed(2),
    }))

    // Dati grafico a torta (distribuzione per tipo)
    const pieData = Object.entries(
        investimenti.reduce((acc: Record<string, number>, inv) => {
            acc[inv.tipoInvestimento] = (acc[inv.tipoInvestimento] || 0) + inv.importoInvestito
            return acc
        }, {})
    ).map(([tipo, valore]) => ({ name: tipo, value: valore }))

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Dettaglio Investimenti</Typography>

            {/* 🔹 Riepilogo Totale */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{xs:12, md:4}}>
                    <SummaryCard title="Totale Investito" value={`${totaleInvestito.toLocaleString('it-IT')} €`} color="#1976d2" />
                </Grid>
                <Grid size={{xs:12, md:4}}>
                    <SummaryCard title="Rendimento Totale Stimato" value={`+${rendimentoTotale.toFixed(2)} €`} color="#2e7d32" />
                </Grid>
                <Grid size={{xs:12, md:4}}>
                    <SummaryCard title="Investimenti Attivi" value={attivi.toString()} color="#ed6c02" />
                </Grid>
            </Grid>

            {/* Grafici */}
            <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid size={{xs:12, md:7}}>
                    <Paper sx={{ p: 2, height: 350 }}>
                        <Typography variant="h6" gutterBottom>Andamento Rendimenti</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="rendimento" stroke="#1976d2" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid size={{xs:12, md:5}}>
                    <Paper sx={{ p: 2, height: 350 }}>
                        <Typography variant="h6" gutterBottom>Distribuzione per Tipo</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${(value as number).toLocaleString('it-IT')} €`}
                                >
                                    {pieData.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Tabella Dettagli */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6">Storico Investimenti</Typography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Importo</TableCell>
                                <TableCell>Durata (mesi)</TableCell>
                                <TableCell>Tasso (%)</TableCell>
                                <TableCell>Stato</TableCell>
                                <TableCell>Data Inizio</TableCell>
                                <TableCell>Data Fine</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {investimenti.map(inv => (
                                <TableRow key={inv.id}>
                                    <TableCell>{inv.identificativo}</TableCell>
                                    <TableCell>{inv.tipoInvestimento}</TableCell>
                                    <TableCell>{inv.importoInvestito} €</TableCell>
                                    <TableCell>{inv.mesi}</TableCell>
                                    <TableCell>{inv.tassoRitornoPrevisto}%</TableCell>
                                    <TableCell>{inv.statoInvestimento}</TableCell>
                                    <TableCell>{new Date(inv.dataInizio).toLocaleDateString('it-IT')}</TableCell>
                                    <TableCell>{new Date(inv.dataFine).toLocaleDateString('it-IT')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    )
}

// Componente per i riepiloghi
function SummaryCard({ title, value, color }: { title: string; value: string; color: string }) {
    return (
        <Paper sx={{ p: 2, textAlign: 'center', borderTop: `4px solid ${color}` }}>
            <Typography variant="subtitle2" color="textSecondary">
                {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color }}>
                {value}
            </Typography>
        </Paper>
    )
}
