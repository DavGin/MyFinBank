import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Button,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Divider,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    TablePagination,
    TableContainer,
} from '@mui/material';
import {type JSX, useState} from 'react';
import { useAppSelector } from '../../app/hooks.ts';
import {
    fetchDettaglioTransazione,
    type PaginatedTransazioniDto,
    type TransazioneDto
} from '../../features/transazioni/api.ts';
import CardPreview from '../Carte/CartaPreview.tsx';
import {
    bloccaCarta,
    dettaglioCarta,
    sbloccaCarta,
    fetchTransazioniByCarta,
    type CartaDto
} from '../../features/Carte/api.ts';
import ModificaCartaDialog from './ModificaCartaDialog.tsx';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EuroIcon from '@mui/icons-material/Euro';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CallMadeIcon from '@mui/icons-material/CallMade';
import CallReceivedIcon from '@mui/icons-material/CallReceived';

export default function CartaDetailPage() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const user = useAppSelector((state) => state.auth.user);
    const secondsLeft = useAppSelector((state) => state.auth.sessionSecondsLeft);
    const isPollingPaused = secondsLeft !== null && secondsLeft <= 10;

    // Stati vari
    const [errorMsg] = useState<string | null>(null);
    const [openEdit, setOpenEdit] = useState(false);
    const [openUnlock, setOpenUnlock] = useState(false);
    const [pin, setPin] = useState('');
    const [pagina, setPagina] = useState(0);
    const [righePerPagina, setRighePerPagina] = useState(10);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    // Query carta
    const { data: carta, isLoading: loadingCarta, isError: errorCarta } = useQuery<CartaDto>({
        queryKey: ['carta', id ?? ''],
        queryFn: () => dettaglioCarta(id!),
    });

    // Query transazioni
    const {
        data: transazioniData,
        isLoading: loadingTx,
        isError: errorTx,
    } = useQuery<PaginatedTransazioniDto>({
        queryKey: ['listaTransazioni', carta?.numeroCarta ?? '', pagina, righePerPagina],
        queryFn: () =>
            carta?.numeroCarta
                ? fetchTransazioniByCarta(carta.numeroCarta, pagina, righePerPagina)
                : Promise.reject('Numero carta non valido'),
        enabled: !!carta?.numeroCarta && !isPollingPaused,
        refetchInterval: 10000,
    });

    const transazioni = transazioniData?.content ?? [];

    // Mutation blocco carta
    const disattivaMutation = useMutation({
        mutationFn: () => bloccaCarta(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['carte'] });
            setSnackbar({ open: true, message: 'Carta disattivata con successo!', severity: 'success' });
        },
        onError: () => setSnackbar({ open: true, message: 'Errore durante la disattivazione', severity: 'error' }),
    });

    // Mutation sblocco carta
    const sbloccaMutation = useMutation({
        mutationFn: () => sbloccaCarta(id!, pin),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['carte'] });
            setSnackbar({ open: true, message: 'Carta sbloccata con successo!', severity: 'success' });
            setOpenUnlock(false);
            setPin('');
        },
        onError: () =>
            setSnackbar({ open: true, message: 'Errore durante lo sblocco della carta', severity: 'error' }),
    });

    // Dettaglio transazione
    const [openDialog, setOpenDialog] = useState(false);
    const [transazioneSelezionata, setTransazioneSelezionata] = useState<TransazioneDto | null>(null);
    const [loadingDettaglio, setLoadingDettaglio] = useState(false);
    const [errorDettaglio, setErrorDettaglio] = useState<string | null>(null);

    const handleApriDettaglio = async (id: number) => {
        setLoadingDettaglio(true);
        setErrorDettaglio(null);
        try {
            const dettaglio = await fetchDettaglioTransazione(id);
            setTransazioneSelezionata(dettaglio);
            setOpenDialog(true);
        } catch {
            setErrorDettaglio('Errore nel caricamento del dettaglio transazione');
        } finally {
            setLoadingDettaglio(false);
        }
    };

    const handleChiudiDialog = () => {
        setOpenDialog(false);
        setTransazioneSelezionata(null);
    };

    const handleChangePage = (_: unknown, newPage: number) => setPagina(newPage);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRighePerPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    const formatDateTime = (date: string | null): string => {
        if (!date) return '—';
        const d = new Date(date);
        const data = d.toLocaleDateString('it-IT');
        const ora = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        return `${data} ${ora}`;
    };

    if (loadingCarta || loadingTx) {
        return (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                    Caricamento...
                </Typography>
            </Box>
        );
    }

    if (errorCarta || errorTx) {
        return (
            <Box sx={{ mt: 4 }}>
                <Alert severity="error">Errore durante il caricamento dei dati.</Alert>
            </Box>
        );
    }
    const numeroFormattato = carta?.numeroCarta.replace(/(.{4})/g, '$1 ').trim();
    const isPrepagata = carta?.tipo === 'PREPAGATA';
    const labelValore = isPrepagata ? 'Saldo disponibile' : 'Plafond residuo';
    const valore = isPrepagata ? carta?.saldoCarta : carta?.plafond;

    return (
        <Box sx={{ mt: 4, mx: 'auto', maxWidth: 1000 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                Dettagli Carta
            </Typography>

            <Grid container spacing={4} alignItems="flex-start">
                <Grid size={{xs:12, md:6}} display="flex" justifyContent="center">
                    <CardPreview
                        numeroCarta={numeroFormattato || ''}
                        nomeTitolare={`${user?.nome ?? ''} ${user?.cognome ?? ''}`.trim() || 'CARDHOLDER NAME'}
                        dataScadenza={carta?.dataScadenza || '' }
                        tipo={carta?.tipo || '' }
                    />
                </Grid>

                <Grid size={{xs:12, md:6}}>
                    <Card sx={{ boxShadow: 3, borderRadius: 3, mb: 3 }}>
                        <CardContent>
                            <Typography sx={{ mb: 2 }}>
                                <CreditCardIcon fontSize="small" sx={{ mr: 1 }} />
                                <strong>Numero:</strong> {numeroFormattato}
                            </Typography>
                            <Typography>
                                <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                                <strong>Titolare:</strong> {`${user?.nome ?? ''} ${user?.cognome ?? ''}`.trim()}
                            </Typography>
                            <Typography>
                                <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} />
                                <strong>Scadenza:</strong> {carta?.dataScadenza}
                            </Typography>
                            <Typography>
                                <strong>Tipo:</strong> {carta?.tipo}
                            </Typography>
                            <Typography>
                                <strong>Circuito:</strong> {carta?.circuito}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                                <EuroIcon fontSize="small" sx={{ mr: 1 }} />
                                <strong>{labelValore}:</strong> {valore} €
                            </Typography>

                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" color="text.secondary">
                                Limite giornaliero: {carta?.limiteGiornaliero} € | Limite mensile: {carta?.limiteMensile} €
                            </Typography>
                        </CardContent>
                    </Card>

                    {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

                    <Grid container spacing={2}>
                        <Grid>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<LockIcon />}
                                onClick={() => disattivaMutation.mutate()}
                                disabled={disattivaMutation.isPending}
                            >
                                Blocca Carta
                            </Button>
                        </Grid>
                        <Grid>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<LockOpenIcon />}
                                onClick={() => setOpenUnlock(true)}
                            >
                                Sblocca Carta
                            </Button>
                        </Grid>
                        <Grid>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<EditIcon />}
                                onClick={() => setOpenEdit(true)}
                            >
                                Modifica
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/* --- SEZIONE TRANSAZIONI --- */}
            <Card sx={{ boxShadow: 2, borderRadius: 3, mt: 4 }}>
                <CardContent>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                        Transazioni
                    </Typography>

                    {transazioni.length === 0 ? (
                        <Typography>Nessuna operazione disponibile</Typography>
                    ) : (
                        <>
                            <TableContainer sx={{ backgroundColor: 'white', borderRadius: 2, boxShadow: 1 }}>
                                <Table>
                                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell>Data contabile</TableCell>
                                            <TableCell>Data operazione</TableCell>
                                            <TableCell>Descrizione</TableCell>
                                            <TableCell>Importo</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transazioni.map((op) => {
                                            let coloreImporto = 'text.primary';
                                            let iconaTipo: JSX.Element | null = null;

                                            switch (op.tipoTransazione) {
                                                case 'BONIFICO':
                                                    coloreImporto = 'error.main';
                                                    iconaTipo = <CallMadeIcon sx={{ color: 'error.main', mr: 1 }} />;
                                                    break;
                                                case 'DEPOSITO':
                                                    coloreImporto = 'success.main';
                                                    iconaTipo = <CallReceivedIcon sx={{ color: 'success.main', mr: 1 }} />;
                                                    break;
                                                default:
                                                    coloreImporto = 'error.main';
                                                    iconaTipo = <ArrowUpwardIcon sx={{ color: 'error.main', mr: 1 }} />;
                                            }

                                            return (
                                                <TableRow
                                                    key={op.id}
                                                    hover
                                                    sx={{ cursor: 'pointer' }}
                                                    onClick={() => handleApriDettaglio(op.id)}
                                                >
                                                    <TableCell>{formatDateTime(op.dataContabile)}</TableCell>
                                                    <TableCell>{formatDateTime(op.dataTransazione)}</TableCell>
                                                    <TableCell>{op.descrizione}</TableCell>
                                                    <TableCell>
                                                        <Typography sx={{ color: coloreImporto, fontWeight: 'bold' }}>
                                                            {iconaTipo}
                                                            {op.importo.toLocaleString('it-IT', {
                                                                style: 'currency',
                                                                currency: 'EUR',
                                                            })}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TablePagination
                                component="div"
                                count={transazioniData?.totalElements ?? 0}
                                page={pagina}
                                onPageChange={handleChangePage}
                                rowsPerPage={righePerPagina}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={[5, 10, 25]}
                            />
                        </>
                    )}
                </CardContent>
            </Card>

            {/* --- Dialog dettaglio transazione --- */}
            <Dialog open={openDialog} onClose={handleChiudiDialog} fullWidth maxWidth="sm">
                <DialogTitle>Dettaglio Transazione</DialogTitle>
                <DialogContent dividers>
                    {loadingDettaglio ? (
                        <CircularProgress />
                    ) : errorDettaglio ? (
                        <Alert severity="error">{errorDettaglio}</Alert>
                    ) : transazioneSelezionata ? (
                        <>
                            <Typography><b>Tipo:</b> {transazioneSelezionata.tipoTransazione}</Typography>
                            <Typography><b>Importo:</b> {transazioneSelezionata.importo} €</Typography>
                            <Typography><b>Categoria:</b> {transazioneSelezionata.categoria}</Typography>
                            <Typography><b>Data operazione:</b> {formatDateTime(transazioneSelezionata.dataTransazione)}</Typography>
                            <Typography><b>Data contabile:</b> {formatDateTime(transazioneSelezionata.dataContabile)}</Typography>
                            <Typography><b>Descrizione:</b> {transazioneSelezionata.descrizione}</Typography>
                            <Typography><b>Destinatario:</b> {transazioneSelezionata.targetIban}</Typography>
                            <Typography><b>Direzione:</b> {transazioneSelezionata.direzione === 'ENTRATA' ? 'Entrata' : 'Uscita'}</Typography>
                            <Typography><b>Stato:</b> {transazioneSelezionata.stato}</Typography>
                        </>
                    ) : (
                        <Typography>Nessun dettaglio disponibile.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleChiudiDialog}>Chiudi</Button>
                </DialogActions>
            </Dialog>

            {/* --- Dialog modifica carta --- */}
            {carta && (
                <ModificaCartaDialog
                    open={openEdit}
                    onClose={() => setOpenEdit(false)}
                    carta={carta}
                    onSuccess={(msg) => setSnackbar({ open: true, message: msg, severity: 'success' })}
                    onError={(msg) => setSnackbar({ open: true, message: msg, severity: 'error' })}
                />
            )}

            {/* --- Dialog sblocca carta --- */}
            <Dialog open={openUnlock} onClose={() => setOpenUnlock(false)}>
                <DialogTitle>Sblocca Carta</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        Inserisci il codice PIN per sbloccare la carta
                    </Typography>
                    <TextField
                        label="PIN"
                        type="password"
                        fullWidth
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        inputProps={{ maxLength: 6 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUnlock(false)}>Annulla</Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => sbloccaMutation.mutate()}
                        disabled={sbloccaMutation.isPending || pin.length !== 6}
                    >
                        Conferma
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- Snackbar --- */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
