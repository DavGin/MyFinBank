import { useState } from "react";
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { simulateFin, type SimulationInput, type SimulationRow } from '../../features/Finanziamenti/api';
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Paper,
    Pagination,
} from '@mui/material';

export default function FinanziamentoSimulationPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<SimulationInput>();
    const [currentPage, setCurrentPage] = useState(1); // Stato per gestire la pagina corrente
    const rowsPerPage = 20; // Numero di righe per pagina

    const mutation = useMutation({
        mutationFn: simulateFin,
        onMutate: (variables) => {
            console.log('Inizio simulazione con i seguenti dati:', variables);
        },
        onSuccess: (data) => {
            console.log('Simulazione completata con successo:', data);
        },
        onError: (error) => {
            console.error('Errore durante la simulazione:', error);
        },
        onSettled: () => {
            console.log('Simulazione completata (successo o errore)');
        },
    });

    const onSubmit = (data: SimulationInput) => {
        console.log('Dati ricevuti dal form:', data);

        const formattedData = {
            ...data,
            importo: Number(data.importo),
            durataMesi: Number(data.durataMesi),
            tassoInteresse: Number(data.tassoInteresse),
            motivo: data.motivo || '',
        };

        console.log('Dati formattati per la simulazione:', formattedData);
        mutation.mutate(formattedData);
    };

    // Calcolo delle righe da mostrare sulla pagina corrente
    const currentRows = mutation.data
        ? mutation.data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
        : [];

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Simulazione Mutuo
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Importo (€)"
                    type="number"
                    {...register('importo', {
                        required: 'Importo obbligatorio',
                        min: { value: 1000, message: 'Minimo 1000€' },
                    })}
                    error={!!errors.importo}
                    helperText={errors.importo?.message}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    label="Durata (mesi)"
                    type="number"
                    {...register('durataMesi', {
                        required: 'Durata obbligatoria',
                        min: { value: 3, message: 'Almeno 3 mesi' },
                        max: { value: 360, message: 'Massimo 360 mesi (30 anni)' },
                    })}
                    error={!!errors.durataMesi}
                    helperText={errors.durataMesi?.message}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    label="Tasso interesse (%)"
                    type="number"
                    inputProps={{ step: 0.01 }}
                    {...register('tassoInteresse', {
                        required: 'Tasso obbligatorio',
                        min: { value: 0.1, message: 'Minimo 0.1%' },
                    })}
                    error={!!errors.tassoInteresse}
                    helperText={errors.tassoInteresse?.message}
                />

                {mutation.isError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        Errore nella simulazione
                    </Alert>
                )}

                <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={mutation.isPending}>
                    {mutation.isPending ? 'Calcolo...' : 'Simula'}
                </Button>
            </form>

            {/* Risultato simulazione */}
            {mutation.isPending && <CircularProgress sx={{ mt: 2 }} />}
            {mutation.isSuccess && mutation.data && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6">Piano Ammortamento</Typography>
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>N° Rata</TableCell>
                                    <TableCell>Data Scadenza</TableCell>
                                    <TableCell>Quota Capitale</TableCell>
                                    <TableCell>Quota Interessi</TableCell>
                                    <TableCell>Totale Rata</TableCell>
                                    <TableCell>Saldo Rimanente</TableCell>
                                </TableRow>
                            </TableHead>
                            {currentRows.length > 0 ? (
                                <TableBody>
                                    {currentRows.map((row: SimulationRow | undefined, idx: number) => {
                                        const rata = row?.numeroRata;
                                        const scadenza = new Date(row.scadenza).toLocaleDateString('it-IT');
                                        const quotaCapitale = row?.quotaCapitale.toFixed(2);
                                        const quotaInteressi = row?.interessi.toFixed(2);
                                        const rataTotale = row?.rataTotale.toFixed(2);
                                        const saldoResiduo = row?.saldoRimanente.toFixed(2);

                                        return (
                                            <TableRow key={idx}>
                                                <TableCell>{rata}</TableCell>
                                                <TableCell>{scadenza}</TableCell>
                                                <TableCell>{quotaCapitale} €</TableCell>
                                                <TableCell>{quotaInteressi} €</TableCell>
                                                <TableCell>{rataTotale} €</TableCell>
                                                <TableCell>{saldoResiduo} €</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            ) : (
                                <Typography sx={{ mt: 2 }}>Nessun dato disponibile.</Typography>
                            )}
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    <Pagination
                        count={Math.ceil(mutation.data.length / rowsPerPage)}
                        page={currentPage}
                        onChange={(event, page) => setCurrentPage(page)}
                        sx={{ mt: 2 }}
                        color="primary"
                    />
                </Box>
            )}
        </Box>
    );
}
