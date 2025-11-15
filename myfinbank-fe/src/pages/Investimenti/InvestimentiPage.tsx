import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Button,
    Paper,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks.ts'
import {
    createInvestimento,
    type CreateInvestimentoInput,
    fetchInvestimenti,
    type Investimento,
} from '../../features/Investimenti/api.ts'
import InvestmentDashboard from '../../features/Investimenti/InvestmentDashboard.tsx'
import MarketSelector from "./MarketSelector.tsx";
import React from "react";

// Mercati disponibili
async function fetchMercatiDisponibili() {
    return [
        { id: 'SP500', nome: 'S&P 500' },
        { id: 'WORLD', nome: 'MSCI World' },
        { id: 'AAPL', nome: 'Apple Inc.' },
        { id: 'MSFT', nome: 'Microsoft' },
        { id: 'TSLA', nome: 'Tesla Motors' },
        { id: 'GOOGL', nome: 'Google (Alphabet)' },
        { id: 'AMZN', nome: 'Amazon' },
        { id: 'BTC', nome: 'Bitcoin' },
    ]
}

export default function InvestimentiPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [openModal, setOpenModal] = React.useState(false)

    const conti = useAppSelector((state) => state.auth.conti)

    const { data: investimenti } = useQuery<Investimento[]>({
        queryKey: ['investimenti'],
        queryFn: fetchInvestimenti,
    })

    const { data: mercati, isLoading: loadingMercati } = useQuery({
        queryKey: ['mercati-investimento'],
        queryFn: fetchMercatiDisponibili,
    })

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateInvestimentoInput>();

    const mutation = useMutation({
        mutationFn: createInvestimento,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['investimenti'] })
            reset()
            setOpenModal(false)
        },
    })

    const onSubmit = (data: CreateInvestimentoInput) => {
        let tipo = 'ALTRO';
        if (['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'].includes(data.simboloMercato)) tipo = 'AZIONE';
        if (['BTC'].includes(data.simboloMercato)) tipo = 'CRIPTO';
        if (['SP500', 'WORLD'].includes(data.simboloMercato)) tipo = 'INDICE';

        mutation.mutate({
            ...data,
            tipoInvestimento: tipo,
            importoInvestito: Number(data.importoInvestito),
            durataMesi: Number(data.durataMesi),
            tassoRitornoPrevisto: Number(data.tassoRitornoPrevisto),
        });
    };

    // Calcolo riepilogo
    const totaleInvestito = investimenti?.reduce((sum, inv) => sum + inv.importoInvestito, 0) ?? 0
    const rendimentoTotale =
        investimenti?.reduce((sum, inv) => sum + (inv.importoInvestito * inv.tassoRitornoPrevisto) / 100, 0) ?? 0
    const attivi = investimenti?.filter((inv) => inv.statoInvestimento === 'ACTIVE').length ?? 0

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                I tuoi Investimenti
            </Typography>

            {/* Riepilogo sintetico */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{xs:12, md:4}}>
                    <SummaryCard title="Totale Investito" value={`${totaleInvestito.toLocaleString('it-IT')} €`} color="#1976d2" />
                </Grid>
                <Grid size={{xs:12, md:4}}>
                    <SummaryCard title="Rendimento Totale Stimato" value={`+${rendimentoTotale.toFixed(2)} €`} color="#2e7d32" />
                </Grid>
                <Grid size={{xs:12, md:4}}>
                    <SummaryCard title="Investimenti Attivi" value={`${attivi}`} color="#ed6c02" />
                </Grid>
            </Grid>

            {/* Pulsanti azione */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
                <Button variant="outlined" color="secondary" onClick={() => navigate('/dashboard/dettaglio')}>
                    Vai al Dettaglio Portafoglio
                </Button>
                <Button variant="contained" color="primary" onClick={() => navigate('/dashboard/simulazione')}>
                    Simula Investimento
                </Button>
                <Button variant="contained" color="success" onClick={() => setOpenModal(true)}>
                    + Nuovo Investimento
                </Button>
            </Box>
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    I tuoi investimenti attivi
                </Typography>

                {investimenti && investimenti.length > 0 ? (
                    <Paper sx={{ p: 2 }}>
                        {investimenti.map((inv) => (
                            <Box
                                key={inv.identificativo}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: '1px solid #eee',
                                    py: 1.5,
                                }}
                            >
                                <Box>
                                    <Typography variant="subtitle1">
                                        {inv.tipoInvestimento} — <strong>{inv.importoInvestito.toLocaleString('it-IT')} €</strong>
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        ID: {inv.identificativo} | Durata: {inv.mesi} mesi | Tasso: {inv.tassoRitornoPrevisto}%
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="info"
                                        onClick={() => navigate(`/dashboard/investimenti/${inv.identificativo}`)}
                                    >
                                        Dettaglio rendimento
                                    </Button>
                                </Box>
                            </Box>
                        ))}
                    </Paper>
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        Nessun investimento presente.
                    </Typography>
                )}
            </Box>

            {/* Analisi mercato */}
            <Box sx={{ mb: 5 }}>
                <Typography variant="h6" gutterBottom>Analisi Mercato e Rendimenti</Typography>
                <InvestmentDashboard />
            </Box>

            {/* Modale nuovo investimento */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Crea Nuovo Investimento</DialogTitle>
                <DialogContent dividers>
                    {(loadingMercati) ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <form id="form-nuovo-investimento" onSubmit={handleSubmit(onSubmit)}>
                            <TextField
                                select
                                fullWidth
                                margin="normal"
                                label="Conto investimento"
                                {...register('numeroConto', { required: 'Seleziona un conto' })}
                                error={!!errors.numeroConto}
                                helperText={errors.numeroConto?.message}
                            >
                                {conti?.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>{c.numeroConto}</MenuItem>
                                ))}
                            </TextField>

                            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                                Seleziona il mercato di riferimento
                            </Typography>
                            <MarketSelector
                                markets={mercati ?? []}
                                register={register}
                                setValue={setValue}
                                fieldName="simboloMercato"
                                error={errors.simboloMercato?.message}
                            />

                            <TextField
                                fullWidth
                                margin="normal"
                                label="Importo (€)"
                                type="number"
                                {...register('importoInvestito', { required: 'Importo obbligatorio' })}
                                error={!!errors.importoInvestito}
                                helperText={errors.importoInvestito?.message}
                            />

                            <TextField
                                fullWidth
                                margin="normal"
                                label="Durata (mesi)"
                                type="number"
                                {...register('durataMesi', { required: 'Durata obbligatoria' })}
                                error={!!errors.durataMesi}
                                helperText={errors.durataMesi?.message}
                            />

                            <TextField
                                fullWidth
                                margin="normal"
                                label="Tasso previsto (%)"
                                type="number"
                                {...register('tassoRitornoPrevisto', { required: 'Tasso obbligatorio' })}
                                error={!!errors.tassoRitornoPrevisto}
                                helperText={errors.tassoRitornoPrevisto?.message}
                            />
                        </form>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Annulla</Button>
                    <Button
                        type="submit"
                        form="form-nuovo-investimento"
                        variant="contained"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? 'Creazione...' : 'Conferma'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

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


