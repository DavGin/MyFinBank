// src/features/conti/ContoForm.tsx
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createConto, type CreateContoInput } from './api'
import {
    Box,
    Button,
    MenuItem,
    TextField,
    Alert,
} from '@mui/material'

export default function ContoForm() {
    const { register, handleSubmit, reset } = useForm<CreateContoInput>()
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: createConto,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conti'] })
            reset()
        },
    })

    const onSubmit = (data: CreateContoInput) => {
        mutation.mutate(data)
    }

    return (
        <Box sx={{ maxWidth: 400, mb: 4 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Tipo di conto"
                    defaultValue=""
                    {...register('tipo', { required: true })}
                >
                    <MenuItem value="Corrente">Corrente</MenuItem>
                    <MenuItem value="Risparmio">Risparmio</MenuItem>
                    <MenuItem value="Investimento">Investimento</MenuItem>
                </TextField>

                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Tipo di valuta"
                    defaultValue=""
                    {...register('valuta', { required: true })}
                >
                    <MenuItem value="EURO">EURO</MenuItem>
                    <MenuItem value="DOLLARO">DOLLARO</MenuItem>
                </TextField>

                {mutation.isError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        Errore nella creazione del conto
                    </Alert>
                )}
                {mutation.isSuccess && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Conto creato con successo
                    </Alert>
                )}

                <Button
                    variant="contained"
                    type="submit"
                    sx={{ mt: 2 }}
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? 'Creazione...' : 'Crea conto'}
                </Button>
            </form>
        </Box>
    )
}
