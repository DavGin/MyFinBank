import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
    fetchListaFinanziamenti,
    createFinanziamento,
    type Finanziamento,
    type CreateFinanziamentoInput,
    fetchRateByNumeroPratica, getFinanziamento
} from '../../features/Finanziamenti/api';
import {
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {useAppSelector} from "../../app/hooks.ts";

export default function FinanziamentoPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [loadingRate, setLoadingRate] = useState(false);
    const [errorRate, setErrorRate] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState(false);

    const secondsLeft = useAppSelector((state) => state.auth.sessionSecondsLeft);
    const isPollingPaused = secondsLeft !== null && secondsLeft <= 10; // blocca quando mancano 10s
    //Query lista mutui
    const { data: finanziamenti, isLoading, isError } = useQuery<Finanziamento[]>({
        queryKey: ['finanziamenti'],
        queryFn: fetchListaFinanziamenti,
        refetchInterval: 10000,
        enabled: !isPollingPaused,
    });

    // Form Hook
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateFinanziamentoInput>();

    //Mutation per richiesta mutuo
    const mutation = useMutation({
        mutationFn: createFinanziamento,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mutui'] });
            reset();
            setOpenModal(false);
        },
    });

    const onSubmit = (data: CreateFinanziamentoInput) => {
        mutation.mutate({
            ...data,
            importo: Number(data.importo),
            durataMesi: Number(data.durataMesi),
            tassoInteresse: Number(data.tassoInteresse),
        });
    };

    const handleDettaglioFinanziamento = async (numeroPratica: string) => {
        setLoadingRate(true);
        setErrorRate(null);
        try {
            // chiamate in parallelo per efficienza
            const [rate, finanziamento] = await Promise.all([
                fetchRateByNumeroPratica(numeroPratica),
                getFinanziamento(numeroPratica),
            ]);

            navigate(`/dashboard/dettaglioRate`, {
                state: {
                    rate,
                    numeroPratica,
                    finanziamento,
                },
            });
        } catch (error) {
            console.error('Errore nel caricamento delle rate o del finanziamento:', error);
            setErrorRate('Errore nel caricamento dei dati del finanziamento');
        } finally {
            setLoadingRate(false);
        }
    };

    return (
        <Grid>
            {/* Lista mutui in card */}
            <Grid container alignItems="center" style={{ minHeight: "50vh"}}>

                {isLoading && <CircularProgress />}
                {isError && <Alert severity="error">Errore caricamento mutui</Alert>}
                <Grid size={{xs:false, sm:false, md:1, lg:2}}></Grid>
                <Grid size={{xs:12, sm:11, md:10, lg:8}}>
                    <Typography variant="h4">I tuoi Finanziamenti</Typography>
                    {finanziamenti && finanziamenti.length > 0 ? (
                    finanziamenti?.map((m) => (
                        <Grid size={{xs:12}} key={m.numeroPratica}>
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    boxShadow: 3,
                                    transition: '0.2s',
                                    '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
                                    cursor: 'pointer',
                                    mt:2
                                }}
                                onClick={() => handleDettaglioFinanziamento(m.numeroPratica)}
                            >
                                <CardContent>
                                    <Typography variant="h5">Pratica n°{m.numeroPratica}</Typography>
                                    <Typography>Importo richiesto: {m.importoRichiesto} €</Typography>
                                    <Typography>Data chiusura: {m.dataChiusura}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                        ): (
                        <Typography variant="subtitle1" marginTop={2} gutterBottom>
                        Richiedi un finanziamento
                        </Typography>
                    )}

                    {loadingRate && <CircularProgress sx={{ mt: 2 }} />}
                    {errorRate && <Alert severity="error" sx={{ mt: 2 }}>{errorRate}</Alert>}
                    <Grid marginTop={2} size={{xs:12, sm:11, md:10, lg:8}}>
                        <Button
                            variant="outlined"
                            sx={{mr:2}}
                            onClick={() => navigate('/dashboard/simulazioneMutui')}
                        >
                            Simulazione finanziamento
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setOpenModal(true)}
                        >
                            Richiedi finanziamento
                        </Button>
                    </Grid>
                </Grid>
                {/* MODAL RICHIESTA MUTUO */}
                <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Richiedi un nuovo Mutuo</DialogTitle>
                    <DialogContent>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <TextField
                                fullWidth margin="normal" label="Importo richiesto (€)" type="number"
                                {...register('importo', { required: 'Importo obbligatorio', min: 1000 })}
                                error={!!errors.importo} helperText={errors.importo?.message}
                            />
                            <TextField
                                fullWidth margin="normal" label="Durata (mesi)" type="number"
                                {...register('durataMesi', { required: 'Durata obbligatoria', min: 12, max: 360 })}
                                error={!!errors.durataMesi} helperText={errors.durataMesi?.message}
                            />
                            <TextField
                                fullWidth margin="normal" label="Tasso interesse (%)" type="number"
                                inputProps={{ step: 0.01 }}
                                {...register('tassoInteresse', { required: 'Tasso obbligatorio', min: 0.1 })}
                                error={!!errors.tassoInteresse} helperText={errors.tassoInteresse?.message}
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenModal(false)}>Annulla</Button>
                        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={mutation.isPending}>
                            Invia richiesta
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </Grid>
    );
}
