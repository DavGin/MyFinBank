import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { modificaCarta, type CartaDto } from '../../features/Carte/api.ts';

type ModificaCartaDialogProps = {
    open: boolean;
    onClose: () => void;
    carta: CartaDto;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
};

export default function ModificaCartaDialog({
                                                open,
                                                onClose,
                                                carta,
                                                onSuccess,
                                                onError,
                                            }: ModificaCartaDialogProps) {
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<Partial<CartaDto>>({
        defaultValues: {
            tipo: carta.tipo,
            circuito: carta.circuito,
            limiteGiornaliero: carta.limiteGiornaliero,
            limiteMensile: carta.limiteMensile,
        },
    });

    const mutation = useMutation({
        mutationFn: modificaCarta,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['carta', carta.id] });
            queryClient.invalidateQueries({ queryKey: ['carte'] });
            reset();
            onClose();
            if (onSuccess) onSuccess('Carta modificata con successo!');
        },
        onError: () => {
            if (onError) onError('Errore durante la modifica della carta');
        },
    });

    const onSubmit = (data: Partial<CartaDto>) => {
        mutation.mutate({ id: carta.id, ...data });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Modifica Carta</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <form id="modifica-carta-form" onSubmit={handleSubmit(onSubmit)}>
                    {/* Tipo */}
                    <TextField
                        select
                        fullWidth
                        label="Tipo Carta"
                        margin="normal"
                        {...register('tipo', { required: 'Seleziona un tipo di carta' })}
                        error={!!errors.tipo}
                        helperText={errors.tipo?.message}
                    >
                        <MenuItem value="DEBITO">Debito</MenuItem>
                        <MenuItem value="CREDITO">Credito</MenuItem>
                        <MenuItem value="PREPAGATA">Prepagata</MenuItem>
                    </TextField>

                    {/* Circuito */}
                    <TextField
                        select
                        fullWidth
                        label="Circuito"
                        margin="normal"
                        {...register('circuito', { required: 'Il circuito è obbligatorio' })}
                        error={!!errors.circuito}
                        helperText={errors.circuito?.message}
                    >
                        <MenuItem value="VISA">Visa</MenuItem>
                        <MenuItem value="MASTERCARD">MasterCard</MenuItem>
                        <MenuItem value="AMEX">American Express</MenuItem>
                    </TextField>

                    {/* Limite Giornaliero */}
                    <TextField
                        fullWidth
                        label="Limite Giornaliero (€)"
                        type="number"
                        margin="normal"
                        {...register('limiteGiornaliero', {
                            required: 'Il limite giornaliero è obbligatorio',
                            min: { value: 1, message: 'Deve essere maggiore di 0' },
                        })}
                        error={!!errors.limiteGiornaliero}
                        helperText={errors.limiteGiornaliero?.message}
                    />

                    {/* Limite Mensile */}
                    <TextField
                        fullWidth
                        label="Limite Mensile (€)"
                        type="number"
                        margin="normal"
                        {...register('limiteMensile', {
                            required: 'Il limite mensile è obbligatorio',
                            min: { value: 1, message: 'Deve essere maggiore di 0' },
                        })}
                        error={!!errors.limiteMensile}
                        helperText={errors.limiteMensile?.message}
                    />
                </form>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Annulla
                </Button>
                <Button
                    form="modifica-carta-form"
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!isDirty || mutation.isPending}
                >
                    Salva
                </Button>
            </DialogActions>
        </Dialog>
    );
}
