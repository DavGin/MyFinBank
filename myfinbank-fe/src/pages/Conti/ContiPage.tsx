import {useQuery} from '@tanstack/react-query';
import {fetchListaConti} from '../../features/Conti/api';
import type { ContoDto } from '../../features/Conti/api';
import {
    Box,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    FormControl,
    Select,
    MenuItem,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import {useState, useEffect, type JSX} from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks.ts';
import { setConto } from '../../features/auth/authSlice.ts';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CallMadeIcon from '@mui/icons-material/CallMade';
import {
    fetchTransazioniByConto,
    type PaginatedTransazioniDto,
    fetchDettaglioTransazione, // 🔹 nuovo metodo API
    type TransazioneDto,
} from '../../features/transazioni/api.ts';
import { Controller, useForm } from 'react-hook-form';

export default function ContiPage() {
    const user = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();

    const secondsLeft = useAppSelector((state) => state.auth.sessionSecondsLeft);
    const isPollingPaused = secondsLeft !== null && secondsLeft <= 10; // blocca quando mancano 10s

    const { data: conti, isLoading: loadingConti, isError:  errorConti } = useQuery<ContoDto[]>({
        queryKey: ['conti'],
        queryFn: fetchListaConti,
        refetchInterval: 10000,
        enabled: !isPollingPaused, // Blocca polling se sessione quasi scaduta
    });

    // React Hook Form per select
    // form per selezione conto
    const { control, watch } = useForm<{ numeroConto: string }>({
        defaultValues: { numeroConto: '' },
    });

    const numeroConto = watch('numeroConto');

    useEffect(() => {
        if (conti) dispatch(setConto(conti));
    }, [conti, dispatch]);

    const contoSelezionato =
        conti?.find((c) => c.numeroConto === numeroConto) ||
        conti?.find((c) => c.tipo === 'CONTO_CORRENTE');
    const defaultConto = conti?.find(c => c.tipo === 'CONTO_CORRENTE')?.numeroConto || '';
    const [pagina, setPagina] = useState(0);
    const [righePerPagina, setRighePerPagina] = useState(10);

    const {
        data: listaTransazioni,
        isLoading: loadingTx,
        isError: errorTx,
    } = useQuery<PaginatedTransazioniDto>({
        queryKey: ['listaTransazioni', contoSelezionato?.numeroConto ?? '', pagina, righePerPagina],
        queryFn: () =>
            contoSelezionato?.numeroConto
                ? fetchTransazioniByConto(contoSelezionato.numeroConto, pagina, righePerPagina)
                : Promise.reject('Numero conto non valido'),
        enabled: !!contoSelezionato?.numeroConto && !isPollingPaused, // Blocca se sessione quasi scaduta
        refetchInterval: 10000,
    });

    // 🔹 Stato per dialog dettaglio transazione
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
        } catch (err) {
            setErrorDettaglio('Errore nel caricamento del dettaglio transazione');
        } finally {
            setLoadingDettaglio(false);
        }
    };

    const handleChiudiDialog = () => {
        setOpenDialog(false);
        setTransazioneSelezionata(null);
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRighePerPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    if (loadingConti || loadingTx) {
        return (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                    Caricamento...
                </Typography>
            </Box>
        );
    }

    if (errorConti || errorTx) {
        return (
            <Box sx={{ mt: 4 }}>
                <Alert severity="error">Errore durante il caricamento dei dati.</Alert>
            </Box>
        );
    }

    const transazioni = (listaTransazioni?.content ?? []) as TransazioneDto[];

    const formattedAccess = contoSelezionato?.ultimoAggiornamento
        ? new Date(contoSelezionato?.ultimoAggiornamento).toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : 'N/D';



    return (
        <Box>

            {contoSelezionato ? (
                <>
                    <Typography variant="h4" gutterBottom>
                        I tuoi conti ({conti?.length})
                    </Typography>
                    {/* Dettagli conto */}
                    <Box
                        sx={{
                            mt: 4,
                            p: 2,
                            backgroundColor: '#f5f5f5',
                            borderRadius: 2,
                            boxShadow: 2,
                            minWidth: 300,
                        }}
                    >
                        <FormControl fullWidth>
                            <Controller
                                name="numeroConto"
                                control={control}
                                defaultValue={defaultConto}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        displayEmpty
                                        sx={{ bgcolor: 'white', border: '1px solid #ccc', borderRadius: 2, mb: 2 }}
                                    >
                                        {conti?.map((conto) => (
                                            <MenuItem key={conto.id} value={conto.numeroConto}>
                                                {conto.tipo} - {conto.numeroConto} - {user?.nome} {user?.cognome}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                        </FormControl>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {/* IBAN */}
                            <Box
                                sx={{
                                    bgcolor: 'white',
                                    pr: 2,
                                    borderRadius: 2,
                                    border: '1px solid #ccc',
                                    height: 120,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    px: 2,
                                    width: 500,
                                }}
                            >
                                <Typography variant="h6" sx={{ ml: 2, mb: 3 }}>
                                    IBAN
                                </Typography>
                                <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
                                    {contoSelezionato.iban}
                                </Typography>
                            </Box>

                            {/* Saldi */}
                            <Box sx={{ textAlign: 'left', width: 270, ml: 8 }}>
                                <Typography variant="h6" sx={{ ml: 4 }}>
                                    SALDO DISPONIBILE
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 4 }}>
                                    {contoSelezionato.saldoDisponibile.toLocaleString('it-IT', {
                                        style: 'currency',
                                        currency: 'EUR',
                                    })}
                                </Typography>
                            </Box>

                            <Box sx={{ pl: 1, textAlign: 'left', width: 270 }}>
                                <Typography variant="h6" sx={{ ml: 4 }}>
                                    SALDO CONTABILE
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 4 }}>
                                    {contoSelezionato.saldoContabile?.toLocaleString('it-IT', {
                                        style: 'currency',
                                        currency: 'EUR',
                                    })}
                                </Typography>
                            </Box>

                            <Box sx={{ pl: 0, flex: 1, textAlign: 'left' }}>
                                <Typography variant="body1" sx={{ ml: 2 }}>
                                    Conto aggiornato al: {formattedAccess}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Tabella transazioni */}
                    <Box
                        sx={{
                            mt: 4,
                            p: 2,
                            backgroundColor: '#f5f5f5',
                            borderRadius: 2,
                            boxShadow: 2,
                            minWidth: 300,
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            OPERAZIONI
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
                                                let coloreImporto: string = 'text.primary';
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
                                                    case 'PRELIEVO':
                                                        coloreImporto = 'error.main';
                                                        iconaTipo = <ArrowUpwardIcon sx={{ color: 'error.main', mr: 1 }} />;
                                                        break;
                                                    case 'RATA_FINANZIAMENTO':
                                                        coloreImporto = 'error.main';
                                                        iconaTipo = <ArrowUpwardIcon sx={{ color: 'error.main', mr: 1 }} />;
                                                        break;
                                                }

                                                return (
                                                    <TableRow
                                                        key={op.id}
                                                        hover
                                                        sx={{ cursor: 'pointer' }}
                                                        onClick={() => handleApriDettaglio(op.id)}
                                                    >
                                                        <TableCell>
                                                            {(op.dataContabile) === null ? "NON CONTABILIZZATA" : new Date(op.dataContabile).toLocaleString('it-IT')}
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(op.dataTransazione).toLocaleString('it-IT')}
                                                        </TableCell>
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

                                {/* 🔹 Paginazione */}
                                <TablePagination
                                    component="div"
                                    count={listaTransazioni?.totalElements ?? 0}
                                    page={pagina}
                                    onPageChange={handleChangePage}
                                    rowsPerPage={righePerPagina}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    rowsPerPageOptions={[5, 10, 25]}
                                />
                            </>
                        )}
                    </Box>
                </>
            ) : (
                <Typography variant="body2">Il conto corrente non esiste.</Typography>
            )}

            {/* 🔹 Dialog dettaglio transazione */}
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
                            <Typography><b>Importo:</b> {transazioneSelezionata.importo} {transazioneSelezionata.valuta === "EURO" ? '€' : '$'}</Typography>
                            <Typography><b>Categoria:</b> {transazioneSelezionata.categoria}</Typography>
                            <Typography><b>Data:</b> {new Date(transazioneSelezionata.dataTransazione).toLocaleString('it-IT')}</Typography>
                            <Typography><b>Data:</b> {new Date(transazioneSelezionata.dataContabile).toLocaleString('it-IT')}</Typography>
                            <Typography><b>Descrizione:</b> {transazioneSelezionata.descrizione}</Typography>
                            <Typography><b>Destinatario:</b> {transazioneSelezionata.targetIban}</Typography>
                            <Typography><b></b> {transazioneSelezionata.direzione === "ENTRATA" ? 'Transazione in entrata': 'Transazione in uscita'}</Typography>
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
        </Box>
    );
}
