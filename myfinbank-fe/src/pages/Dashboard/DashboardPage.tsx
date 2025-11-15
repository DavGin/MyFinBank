// src/features/dashboard/DashboardPage.tsx
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
} from '@mui/material';
import { type ContoDto, fetchListaConti } from '../../features/Conti/api';
import { useQuery } from '@tanstack/react-query';
import {
    fetchTransazioniByConto,
    type PaginatedTransazioniDto, type Transazioni,
} from "../../features/transazioni/api.ts";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';
import { setConto } from "../../features/auth/authSlice.ts";
import { type JSX, useEffect, useState } from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import CallMadeIcon from "@mui/icons-material/CallMade";

export default function DashboardPage() {
    const user = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();

    const secondsLeft = useAppSelector((state) => state.auth.sessionSecondsLeft);
    const isPollingPaused = secondsLeft !== null && secondsLeft <= 10; // blocca quando mancano 10s

    const { data: conti, isLoading: loadingConti, isError: errorConti } = useQuery<ContoDto[]>({
        queryKey: ['conti'],
        queryFn: fetchListaConti,
        refetchInterval: 10000,
        enabled: !isPollingPaused, //Blocca polling se sessione quasi scaduta
    });

    useEffect(() => {
        if (conti) dispatch(setConto(conti));
    }, [conti, dispatch]);

    const contoSelezionato = conti?.find(c => c.tipo === "CONTO_CORRENTE");

    const [pagina] = useState(0);
    const [righePerPagina] = useState(5);

    const { data: listaTransazioni, isLoading: loadingTx } = useQuery<PaginatedTransazioniDto>({
        queryKey: ['listaTransazioni', contoSelezionato?.numeroConto ?? '', pagina, righePerPagina],
        queryFn: () => contoSelezionato?.numeroConto
            ? fetchTransazioniByConto(contoSelezionato.numeroConto, pagina, righePerPagina)
            : Promise.reject('Numero conto non valido'),
        enabled: !!contoSelezionato?.numeroConto  && !isPollingPaused,
        refetchInterval: 10000,
    });

    console.log("listaTransazioni ----> ", listaTransazioni)

    if (loadingConti || loadingTx) {
        return (
            <Box sx={{ mt: 4 }}>
                <CircularProgress />
                <Typography variant="body2">Caricamento...</Typography>
            </Box>
        );
    }

    if (errorConti) {
        return (
            <Box sx={{ mt: 4 }}>
                <Alert severity="error">Si è verificato un errore durante il caricamento dei conti.</Alert>
            </Box>
        );
    }

    const transazioni = (listaTransazioni?.content ?? []) as Transazioni[];

    type AggregatedData = {
        [month: string]: { month: string; Entrate: number; Uscite: number; }
    };

    const aggregated: AggregatedData = transazioni.reduce((acc, tx) => {
        const month = new Date(tx.dataTransazione).toLocaleString("default", { month: "short", year: "numeric" });
        if (!acc[month]) acc[month] = { month, Entrate: 0, Uscite: 0 };
        if (tx.direzione === "ENTRATA") acc[month].Entrate += tx.importo;
        else acc[month].Uscite += tx.importo;
        return acc;
    }, {} as AggregatedData);

    const chartData = Object.values(aggregated);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Benvenuto {user?.nome} {user?.cognome}
            </Typography>

            {contoSelezionato ? (
                <>
                    {/* Dettagli conto */}
                    <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, boxShadow: 2, minWidth: 300 }}>
                        <Box sx={{ bgcolor: 'white', border: '1px solid #ccc', borderRadius: 2, mb: 2 }}>
                            <Typography variant="h6" sx={{ ml: 2 }}>
                                {contoSelezionato.tipo} - {contoSelezionato.numeroConto} - {user?.nome} {user?.cognome}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {/* IBAN */}
                            <Box sx={{ bgcolor: 'white', pr: 2, borderRadius: 2, border: '1px solid #ccc', height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 2, width: 500 }}>
                                <Typography variant="h6" sx={{ ml: 2, mb: 3 }}>IBAN</Typography>
                                <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>{contoSelezionato.iban}</Typography>
                            </Box>

                            {/* Saldi */}
                            <Box sx={{ textAlign: 'left', width: 270, ml: 8 }}>
                                <Typography variant="h6" sx={{ ml: 4 }}>SALDO DISPONIBILE</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 4 }}>
                                    {contoSelezionato.saldoDisponibile.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                                </Typography>
                            </Box>

                            <Box sx={{ pl: 1, textAlign: 'left', width: 270 }}>
                                <Typography variant="h6" sx={{ ml: 4 }}>SALDO CONTABILE</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 4 }}>
                                    {contoSelezionato.saldoContabile.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                                </Typography>
                            </Box>

                            <Box sx={{ pl: 0, flex: 1, textAlign: 'left' }}>
                                <Typography variant="body1" sx={{ ml: 2 }}>dati aggiornati in tempo reale</Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Tabella transazioni */}
                    <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, boxShadow: 2, minWidth: 300 }}>
                        <Typography variant="h6" gutterBottom>Ultime operazioni</Typography>
                        {transazioni.length === 0 ? (
                            <Typography>Nessuna operazione disponibile</Typography>
                        ) : (
                            <TableContainer sx={{ backgroundColor: "white", borderRadius: 2, boxShadow: 1 }}>
                                <Table>
                                    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                        <TableRow>
                                            <TableCell>Data</TableCell>
                                            <TableCell>Tipo</TableCell>
                                            <TableCell>Importo</TableCell>
                                            <TableCell>Descrizione</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transazioni.map(op => {
                                            let coloreImporto: "success.main" | "error.main" | "text.primary" = "text.primary";
                                            let iconaTipo: JSX.Element | null = null;

                                            switch (op.tipoTransazione) {
                                                case "BONIFICO":
                                                    coloreImporto = "error.main";
                                                    iconaTipo = <CallMadeIcon sx={{ color: "error.main", mr: 1 }} />;
                                                    break;
                                                case "DEPOSITO":
                                                    coloreImporto = "success.main";
                                                    iconaTipo = <CallReceivedIcon sx={{ color: "success.main", mr: 1 }} />;
                                                    break;
                                                case "PRELIEVO":
                                                    coloreImporto = "error.main";
                                                    iconaTipo = <ArrowUpwardIcon sx={{ color: "error.main", mr: 1 }} />;
                                                    break;
                                            }

                                            return (
                                                <TableRow key={op.id}>
                                                    <TableCell>{new Date(op.dataTransazione).toLocaleString("it-IT")}</TableCell>
                                                    <TableCell sx={{ display: "flex", alignItems: "center" }}>{iconaTipo}{op.tipoTransazione}</TableCell>
                                                    <TableCell>
                                                        <Typography sx={{ color: coloreImporto, fontWeight: 'bold' }}>
                                                            {op.importo.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>{op.descrizione}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>

                    {/* Grafico entrate/uscite */}
                    <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, boxShadow: 2, minWidth: 300 }}>
                        <Typography variant="h6" gutterBottom>Andamento Entrate/Uscite</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number) => value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                                    labelFormatter={(label) => `Mese: ${label}`}
                                />
                                <Legend verticalAlign="top" />
                                <defs>
                                    <linearGradient id="colorEntrate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4caf50" stopOpacity={0.2} />
                                    </linearGradient>
                                    <linearGradient id="colorUscite" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f44336" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#f44336" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <Bar dataKey="Entrate" name="Entrate" radius={[10, 10, 0, 0]} fill="url(#colorEntrate)" />
                                <Bar dataKey="Uscite" name="Uscite" radius={[10, 10, 0, 0]} fill="url(#colorUscite)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </>
            ) : (
                <Typography variant="body2">Il conto corrente non esiste.</Typography>
            )}
        </Box>
    );
}
