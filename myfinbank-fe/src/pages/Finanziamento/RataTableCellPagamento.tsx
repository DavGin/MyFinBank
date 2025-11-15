import React from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    Typography,
    Select,
    MenuItem,
    Snackbar,
    Alert,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {pagaRata, type PagaRataDto, type Rata} from '../../features/Finanziamenti/api';
import { useAppSelector } from "../../app/hooks.ts";

export default function RataTableCellPagamento({
                                                   r,
                                                   numeroPratica
                                               }: {
    r: Rata;
    numeroPratica: string;
    disabled?: boolean;
}) {
    const queryClient = useQueryClient();
    const conti = useAppSelector((state) => state.auth.conti);
    const [contoSelezionato, setContoSelezionato] = React.useState<string>('');

    // stati modale
    const [openModal, setOpenModal] = React.useState(false);
    const [metodoPagamento, setMetodoPagamento] = React.useState<'CONTO' | 'CARTA'>('CONTO');
    const [numeroCarta, setNumeroCarta] = React.useState('');
    const [scadenzaCarta, setScadenzaCarta] = React.useState('');
    const [cvvCarta, setCVVCarta] = React.useState('');

    // snackbar
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

    //MUTATION CORRETTA
    const mutation = useMutation({
        mutationFn: (data: PagaRataDto) => pagaRata(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rate', numeroPratica] });
            setSnackbarSeverity('success');
            setSnackbarMessage('Pagamento effettuato con successo');
            setSnackbarOpen(true);
        },
        onError: () => {
            setSnackbarSeverity('error');
            setSnackbarMessage('Errore durante il pagamento');
            setSnackbarOpen(true);
        },
    });

    const handleApriModal = () => setOpenModal(true);
    const handleChiudiModal = () => {
        setOpenModal(false);
        setMetodoPagamento('CONTO');
        setNumeroCarta('');
        setScadenzaCarta('');
        setCVVCarta('');
    };

    const handleConfermaPagamento = () => {
        if (metodoPagamento === 'CARTA' && (!numeroCarta || !scadenzaCarta || !cvvCarta)) {
            setSnackbarSeverity('error');
            setSnackbarMessage('Compila tutti i campi della carta');
            setSnackbarOpen(true);
            return;
        }

        if (metodoPagamento === 'CONTO' && !contoSelezionato) {
            setSnackbarSeverity('error');
            setSnackbarMessage('Seleziona un conto per procedere');
            setSnackbarOpen(true);
            return;
        }

        const data: PagaRataDto = {
            numeroPratica,
            numeroRata: String(r.numeroRata),
            numeroConto: metodoPagamento === 'CONTO' ? contoSelezionato : '',
            numeroCarta: metodoPagamento === 'CARTA' ? numeroCarta : '',
            scadenzaCarta: metodoPagamento === 'CARTA' ? scadenzaCarta : '',
            CVV: metodoPagamento === 'CARTA' ? cvvCarta : '',
        };

        mutation.mutate(data);
        handleChiudiModal();
    };

    const handleCloseSnackbar = () => setSnackbarOpen(false);

    return (
        <>
            <Box>
                <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={handleApriModal}
                    disabled={mutation.isPending || r.statoRata === 'PAGATO'}
                >
                    {r.statoRata === 'PAGATO' ? 'Pagata' : 'Paga'}
                </Button>
            </Box>

            {/* DIALOG PAGAMENTO */}
            <Dialog open={openModal} onClose={handleChiudiModal} maxWidth="xs" fullWidth>
                <DialogTitle>Pagamento Rata n° {r.numeroRata}</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom>
                        Importo da pagare: <b>{r.rataTotale.toFixed(2)} €</b>
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Seleziona metodo di pagamento:
                    </Typography>

                    <RadioGroup
                        value={metodoPagamento}
                        onChange={(e) => setMetodoPagamento(e.target.value as 'CONTO' | 'CARTA')}
                        sx={{ mt: 1 }}
                    >
                        <FormControlLabel value="CONTO" control={<Radio />} label="Conto Corrente" />
                        <FormControlLabel value="CARTA" control={<Radio />} label="Carta di Credito" />
                    </RadioGroup>

                    {metodoPagamento === 'CONTO' && (
                        <>
                            <Typography variant="body2" sx={{ mt: 2 }}>
                                Seleziona conto:
                            </Typography>
                            <Select
                                fullWidth
                                size="small"
                                value={contoSelezionato}
                                onChange={(e) => setContoSelezionato(e.target.value)}
                                sx={{ mt: 1 }}
                            >
                                {conti
                                    ?.filter((c) => c.tipo === 'CONTO_CORRENTE')
                                    .map((c) => (
                                        <MenuItem key={c.id} value={c.numeroConto}>
                                            {c.numeroConto} ({c.saldoDisponibile.toFixed(2)} €)
                                        </MenuItem>
                                    ))}
                            </Select>
                        </>
                    )}

                    {metodoPagamento === 'CARTA' && (
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Numero Carta"
                                size="small"
                                fullWidth
                                value={numeroCarta}
                                onChange={(e) => setNumeroCarta(e.target.value)}
                            />
                            <TextField
                                label="Scadenza (MM/AA)"
                                size="small"
                                fullWidth
                                value={scadenzaCarta}
                                onChange={(e) => setScadenzaCarta(e.target.value)}
                            />
                            <TextField
                                label="CVC"
                                size="small"
                                fullWidth
                                value={cvvCarta}
                                onChange={(e) => setCVVCarta(e.target.value)}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleChiudiModal}>Annulla</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleConfermaPagamento}
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? 'Elaborazione...' : 'Conferma Pagamento'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* SNACKBAR */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
