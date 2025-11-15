// src/features/profile/ProfilePage.tsx
import { useForm} from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile, updatePassword, type Profile } from '../../features/profile/api'
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Divider,
} from '@mui/material'
import React from "react";

// Funzione di utility per logging
const log = (message: string, data?: any) => {
    console.log(`[ProfilePage] ${message}`, data || '')
}


type PasswordForm = {
    oldPassword: string
    newPassword: string
    confirmPassword: string
}

export default function ProfilePage() {
    const queryClient = useQueryClient()

    // --- Profilo base ---
    const { data: profile, isLoading, isError } = useQuery<Profile>({
        queryKey: ['profile'],
        queryFn: getProfile,
    })

    const { register, handleSubmit, reset } = useForm<Profile>({
        defaultValues: profile,
    })

    React.useEffect(() => {
        if (profile) reset(profile)
        log('Form del profilo resettato con i dati caricati', profile)
    }, [profile, reset])

    const updateProfileMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: (updated) => {
            queryClient.setQueryData(['profile'], updated)
            log('Profilo aggiornato con successo', updated)
        },
        onError: (error) => log('Errore durante l\'aggiornamento del profilo', error),
    })

    const onSubmitProfile = (data: Profile) => {
        log('Invio form di aggiornamento profilo con dati:', data)
        updateProfileMutation.mutate(data)
    }

    // --- Modifica password ---
    const {
        register: registerPwd,
        handleSubmit: handleSubmitPwd,
        reset: resetPwd,
    } = useForm<PasswordForm>()

    const updatePasswordMutation = useMutation({
        mutationFn: updatePassword,
        onSuccess: () => {
            resetPwd()
            log('Password aggiornata con successo')
        },
        onError: (error) => log('Errore durante l\'aggiornamento della password', error),
    })

    const onSubmitPassword = (data: PasswordForm) => {
        if (data.newPassword !== data.confirmPassword) {
            alert('Le password non coincidono')
            log('Errore di validazione: le nuove password non coincidono', data)
            return
        }
        log('Invio form di aggiornamento password con dati:', {
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
        })
        updatePasswordMutation.mutate({
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
        })
    }

    if (isLoading) return <CircularProgress />
    if (isError) return <Alert severity="error">Errore caricamento profilo</Alert>

    return (
        <Box sx={{ maxWidth: 400 }}>
            <Typography variant="h5" gutterBottom>
                Il mio profilo
            </Typography>

            {/* Form dati utente */}
            <form onSubmit={handleSubmit(onSubmitProfile)}>
                <TextField fullWidth margin="normal" label="Username" disabled {...register('username')} />
                <TextField fullWidth margin="normal" label="Nome" {...register('nome')} />
                <TextField fullWidth margin="normal" label="Cognome" {...register('cognome')} />
                <TextField fullWidth margin="normal" label="Email" type="email" {...register('email')} />
                <TextField fullWidth margin="normal" label="Codice fiscale" disabled {...register('codiceFiscale')} />
                <TextField fullWidth margin="normal" label="Data di nascita" disabled {...register('dataNascita')} />

                {updateProfileMutation.isError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        Errore aggiornamento dati
                    </Alert>
                )}
                {updateProfileMutation.isSuccess && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Profilo aggiornato
                    </Alert>
                )}

                <Button
                    variant="contained"
                    type="submit"
                    sx={{ mt: 2 }}
                    disabled={updateProfileMutation.isPending}
                >
                    {updateProfileMutation.isPending ? 'Salvataggio...' : 'Salva modifiche'}
                </Button>
            </form>

            <Divider sx={{ my: 4 }} />

            {/* Form modifica password */}
            <Typography variant="h6" gutterBottom>
                Modifica password
            </Typography>
            <form onSubmit={handleSubmitPwd(onSubmitPassword)}>
                <TextField
                    fullWidth
                    margin="normal"
                    type="password"
                    label="Password attuale"
                    {...registerPwd('oldPassword', { required: true })}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    type="password"
                    label="Nuova password"
                    {...registerPwd('newPassword', { required: true })}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    type="password"
                    label="Conferma nuova password"
                    {...registerPwd('confirmPassword', { required: true })}
                />

                {updatePasswordMutation.isError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        Errore modifica password
                    </Alert>
                )}
                {updatePasswordMutation.isSuccess && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Password aggiornata
                    </Alert>
                )}

                <Button
                    variant="outlined"
                    type="submit"
                    sx={{ mt: 2 }}
                    disabled={updatePasswordMutation.isPending}
                >
                    {updatePasswordMutation.isPending ? 'Aggiornamento...' : 'Cambia password'}
                </Button>
            </form>
        </Box>
    )
}
