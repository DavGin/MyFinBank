import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
    Typography,
    Button,
    Grid,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
} from '@mui/material';
import { useState } from 'react';
import { useAppSelector } from '../../app/hooks.ts';
import CardPreview from '../Carte/CartaPreview.tsx';
import {aggiungiCarta, type CartaDto, type CartaRequest, listaCarte} from "../../features/Carte/api.ts";
import {useNavigate} from "react-router-dom";

export default function CartePage() {
    const user = useAppSelector((state) => state.auth.user);
    const queryClient = useQueryClient();
    const [openModal, setOpenModal] = useState(false);
    const navigate = useNavigate();
    // Recupera lista carte
    const { data: carte, isLoading, isError, isFetching } = useQuery<CartaDto[]>({
        queryKey: ['carte'],
        queryFn: listaCarte,
        refetchInterval: 100000,
    });
    // Recupera conti utente dallo stato Redux
    const conti = useAppSelector((state) => state.auth.conti);

    // Form Hook
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CartaRequest>();

    // Mutation per aggiungere carta
    const mutation = useMutation({
        mutationFn: aggiungiCarta,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['carte'] });
            reset();
            setOpenModal(false);
        },
    });

    const onSubmit = (data: CartaRequest) => {
        mutation.mutate({
            ...data,
            numeroConto: data.numeroConto,
            tipo:data.tipo
        });
    };



    return (
        <Grid container justifyContent="center" sx={{ mt: 4 }}>
            <Grid size={{xs:12, md:10, lg:8}}>
                <Typography variant="h4" gutterBottom>
                    Le tue Carte
                </Typography>

                {/* Stato caricamento */}
                {isLoading || isFetching ? (
                    <CircularProgress />
                ) : isError ? (
                    <Alert severity="error">Errore durante il caricamento delle carte</Alert>
                ) : carte && carte.length > 0 ? (
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        {carte.map((carta) => (
                            <Grid size={{xs:12, sm:6, md:4}} key={carta.id}>
                                <CardPreview
                                    numeroCarta={carta.numeroCarta.replace(/(.{4})/g, '$1 ').trim()}
                                    nomeTitolare={`${user?.nome ?? ''} ${user?.cognome ?? ''}`.trim() || 'CARDHOLDER NAME'}
                                    dataScadenza={carta.dataScadenza}
                                    tipo={carta.tipo}
                                    onClick={() => navigate(`/dashboard/dettaglioCarta/${carta.id}`)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Nessuna carta trovata. Aggiungine una nuova!
                    </Typography>
                )}

                <Grid size={{xs:12}} mt={3} >
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenModal(true)}
                    >
                        Aggiungi Carta
                    </Button>
                </Grid>
            </Grid>

            {/* Modal Aggiungi Carta */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>Aggiungi una nuova carta</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit(onSubmit)}>

                        <TextField
                            select
                            fullWidth
                            margin="normal"
                            label="Tipo Carta"
                            {...register('tipo', { required: 'Seleziona un tipo di carta' })}
                            error={!!errors.tipo}
                            helperText={errors.tipo?.message}
                        >
                            <MenuItem value="DEBITO">Debito</MenuItem>
                            <MenuItem value="CREDITO">Credito</MenuItem>
                            <MenuItem value="PREPAGATA">Prepagata</MenuItem>
                        </TextField>

                        {/* Selettore conto, popolato da Redux */}
                        <TextField
                            fullWidth
                            select
                            margin="normal"
                            label="Collega a conto"
                            {...register('numeroConto')}
                            helperText="Necessario solo per carte di debito o credito"
                        >
                            <MenuItem value="">Nessuno (solo prepagata)</MenuItem>
                            {conti?.map((conto: any) => (
                                <MenuItem key={conto.id} value={conto.numeroConto}>
                                    {conto.numeroConto} — Saldo: {conto.saldoDisponibile ?? 0} €
                                </MenuItem>
                            ))}
                        </TextField>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Annulla</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit(onSubmit)}
                        disabled={mutation.isPending}
                    >
                        Salva
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
}
