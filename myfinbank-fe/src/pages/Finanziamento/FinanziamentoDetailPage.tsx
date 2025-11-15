import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Typography,
    Alert,
    TablePagination,
    Grid,
    Divider
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import { type Rata } from '../../features/Finanziamenti/api';
import { fetchRateByNumeroPratica, getFinanziamento } from '../../features/Finanziamenti/api';
import FinanaziamentoPieChart from './FinanaziamentoPieChart';
import RataTableCellPagamento from "./RataTableCellPagamento.tsx";

export default function FinanziamentoDetailPage() {
    const location = useLocation();
    const numeroPratica = location.state?.numeroPratica;

    const [rate, setRate] = useState<Rata[]>(location.state?.rate || []);
    const [finanziamento, setFinanziamento] = useState(location.state?.finanziamento || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    //refresh automatico ogni 10 secondi
    useEffect(() => {
        if (!numeroPratica) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [nuoveRate, nuovoFinanziamento] = await Promise.all([
                    fetchRateByNumeroPratica(numeroPratica),
                    getFinanziamento(numeroPratica),
                ]);
                setRate(nuoveRate);
                setFinanziamento(nuovoFinanziamento);
                setError(null);
            } catch (err) {
                console.error("Errore aggiornando le rate:", err);
                setError("Errore durante l’aggiornamento dei dati.");
            } finally {
                setLoading(false);
            }
        };

        // Prima chiamata immediata
        fetchData();

        // Poi ogni 10 secondi
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [numeroPratica]);

    const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const finanziamentoInAttesa = finanziamento?.stato === 'IN_ATTESA_DI_APPROVAZIONE';

    return (
        <Box sx={{ mt: 4, p: 2 }}>
            <Typography variant="h5" gutterBottom>
                Dettaglio Finanziamento
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}
            {loading && <Alert severity="info">Aggiornamento dati in corso...</Alert>}

            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Numero Pratica: <b>{numeroPratica}</b>
                        </Typography>
                        {finanziamento && (
                            <>
                                <Typography>Importo finanziato: {finanziamento.importoRichiesto?.toFixed(2)} €</Typography>
                                <Typography>Importo Totale: {finanziamento.importoTotale?.toFixed(2)} €</Typography>
                                <Typography>Tasso: {finanziamento.tassoInteresse}%</Typography>
                                <Typography>Durata: {finanziamento.durataMesi} mesi</Typography>
                                <Typography>Data chiusura: {finanziamento.dataChiusura}</Typography>
                                <Typography>Stato: {finanziamento.stato}</Typography>
                            </>
                        )}
                    </Grid>

                    {!finanziamentoInAttesa && (
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FinanaziamentoPieChart rate={rate} />
                        </Grid>
                    )}
                </Grid>
            </Paper>

            {!finanziamentoInAttesa ? (
                <>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="h6" gutterBottom>
                        Tutte le Rate
                    </Typography>

                    {rate.length === 0 ? (
                        <Alert severity="info">Nessuna rata disponibile.</Alert>
                    ) : (
                        <Paper>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>Data Scadenza</TableCell>
                                            <TableCell>Quota Capitale</TableCell>
                                            <TableCell>Quota Interessi</TableCell>
                                            <TableCell>Totale Rata</TableCell>
                                            <TableCell>Saldo Rimanente</TableCell>
                                            <TableCell>Stato</TableCell>
                                            <TableCell>Azioni</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rate
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((r) => (
                                                <TableRow key={r.numeroRata}>
                                                    <TableCell>{r.numeroRata}</TableCell>
                                                    <TableCell>{new Date(r.scadenza).toLocaleDateString('it-IT')}</TableCell>
                                                    <TableCell>{r.quotaCapitale.toFixed(2)} €</TableCell>
                                                    <TableCell>{r.interessi.toFixed(2)} €</TableCell>
                                                    <TableCell>{r.rataTotale.toFixed(2)} €</TableCell>
                                                    <TableCell>{r.saldoRimanente.toFixed(2)} €</TableCell>
                                                    <TableCell>
                                                        {r.statoRata === 'PAGATO' ? (
                                                            <span style={{ color: 'green' }}>✔ Pagata</span>
                                                        ) : r.statoRata === 'SCADUTO' ? (
                                                            <span style={{ color: 'red' }}>✘ Scaduta</span>
                                                        ) : r.statoRata === 'IN_ATTESA' ? (
                                                            <span style={{ color: 'blue' }}>⌛ In lavorazione</span>
                                                        ) : (
                                                            <span style={{ color: 'orange' }}>Da Pagare</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <RataTableCellPagamento
                                                            r={r}
                                                            numeroPratica={numeroPratica}
                                                            disabled={r.statoRata === 'PAGATO'}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                count={rate.length}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Righe per pagina"
                            />
                        </Paper>
                    )}
                </>
            ) : (
                <Alert severity="info">
                    Il finanziamento è in attesa di approvazione. Le rate saranno disponibili una volta approvato.
                </Alert>
            )}
        </Box>
    );
}
