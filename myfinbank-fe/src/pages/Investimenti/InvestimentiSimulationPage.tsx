import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import {
    simulateInvestimento,
    type SimulationInvestimentoInput,
    type SimulazioneInvestimentoOutputDto
} from '../../features/Investimenti/api';
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

type MeseCapitaleDettaglio = {
    mese: number;
    capitale: number;
};

// Funzione per calcolare i dettagli mensili del capitale
const calcolaDettagliMesi = (importoIniziale: number, mesi: number, tassoPrevisto: number): MeseCapitaleDettaglio[] => {
    if (
        !importoIniziale ||       // Controlla che l'importo iniziale sia valido
        !mesi || mesi <= 0 ||     // Controlla che i mesi siano validi
        !tassoPrevisto || tassoPrevisto <= 0 // Controlla che il tasso sia positivo
    ) {
        console.error('Errore: Input non valido per il calcolo dei dettagli', { importoIniziale, mesi, tassoPrevisto });
        return [];
    }

    const risultati: MeseCapitaleDettaglio[] = [];
    let capitale = importoIniziale;

    for (let mese = 1; mese <= mesi; mese++) {
        capitale += capitale * (tassoPrevisto / 100 / 12); // Calcolo del rendimento mensile
        risultati.push({ mese, capitale });
    }

    return risultati;
};

// Componente
export default function SimulazioneInvestimentoPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<SimulationInvestimentoInput>();

    const mutation = useMutation<SimulazioneInvestimentoOutputDto, Error, SimulationInvestimentoInput>({
        mutationFn: simulateInvestimento,
    });

    // Gestione invio del form
    const onSubmit = (data: SimulationInvestimentoInput) => {
        mutation.mutate({
            ...data,
            importoIniziale: Number(data.importoIniziale),
            mesi: Number(data.mesi),
            tassoPrevisto: Number(data.tassoPrevisto),
        });
    };

    const risultatiDettagliati = mutation.isSuccess
        ? calcolaDettagliMesi(
            mutation.data?.importoIniziale || 0,
            mutation.data?.mesi || 0,
            mutation.data?.tassoPrevisto || 0
        )
        : [];

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Simulazione Investimento</Typography>

            {/* Form per la simulazione */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Importo Iniziale (€)"
                    type="number"
                    {...register('importoIniziale', {
                        required: 'Importo iniziale obbligatorio',
                        min: { value: 1, message: 'Importo minimo 1€' },
                    })}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Durata (mesi)"
                    type="number"
                    {...register('mesi', {
                        required: 'Durata obbligatoria',
                        min: { value: 1, message: 'Durata minima 1 mese' },
                    })}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Rendimento Annuale (%)"
                    type="number"
                    step="0.01"
                    {...register('tassoPrevisto', {
                        required: 'Rendimento obbligatorio',
                        min: { value: 0.01, message: 'Rendimento minimo 0.01%' },
                    })}
                />
                <Button type="submit" variant="contained">Simula</Button>
            </form>

            {/* Mostra i risultati */}
            {mutation.isPending && <CircularProgress sx={{ mt: 2 }} />}

            {mutation.isSuccess && mutation.data && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6">Risultati</Typography>

                    <Alert severity="info" sx={{ my: 2 }}>
                        <strong>Capitale finale:</strong>{' '}
                        {typeof mutation.data.importoFinale === 'number'
                            ? mutation.data.importoFinale.toFixed(2)
                            : 'N/A'} €<br />

                        <strong>Interessi totali:</strong>{' '}
                        {typeof mutation.data.importoFinale === 'number' &&
                        typeof mutation.data.importoIniziale === 'number'
                            ? (mutation.data.importoFinale - mutation.data.importoIniziale).toFixed(2)
                            : 'N/A'} €
                    </Alert>

                    {/* Grafico */}
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={risultatiDettagliati}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mese" />
                            <YAxis />
                            <Tooltip
                                formatter={(value: number) => (typeof value === 'number' ? value.toFixed(2) : 'N/A')}
                            />
                            <Line
                                type="monotone"
                                dataKey="capitale"
                                stroke="#1976d2"
                            />
                        </LineChart>
                    </ResponsiveContainer>

                    {/* Tabella */}
                    <TableContainer component={Paper} sx={{ mt: 3 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mese</TableCell>
                                    <TableCell>Capitale (€)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {risultatiDettagliati.map((row) => (
                                    <TableRow key={row.mese}>
                                        <TableCell>{row.mese}</TableCell>
                                        <TableCell>{row.capitale ? row.capitale.toFixed(2) : 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Box>
    );
}
