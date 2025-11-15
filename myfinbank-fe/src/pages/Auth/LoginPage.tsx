import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useAppDispatch } from "../../app/hooks";
import { setCredentials, setUser } from "../../features/auth/authSlice";
import { login, type ResponseData } from "../../api/authApi";
import {
    TextField,
    Button,
    Typography,
    CircularProgress,
    Card,
    CardHeader,
    CardContent,
    InputAdornment,
    IconButton,
    Link,
    Grid, Snackbar, Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../../features/profile/api";
import "../../theme/page.css";

type FormData = {
    identifier: string;
    password: string;
};

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [error] = useState<string | null>(null);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"error" | "success">("error");

    // funzione per mostrare il messaggio
    const showSnackbar = (message: string, severity: "error" | "success" = "error") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

// funzione per chiudere il snackbar
    const handleSnackbarClose = () => setSnackbarOpen(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault();

    // React Query Mutation per login
    const mutation = useMutation<ResponseData, unknown, FormData>({
        mutationFn: login,
        onSuccess: async (data) => {
            const accessToken = data.accessToken || data.access_token || data.token || "";
            const refreshToken = data.refreshToken || data.refresh_token || "";
            const userFromBody = data.user || (data.username ? { username: data.username } : null);

            const user = { ...(userFromBody || { username: "" }), nome: "", cognome: "", ruolo: "", email: "" , ultimoAccesso: ""};
            dispatch(setCredentials({ user, accessToken, refreshToken }));

            const profile = await getProfile();
            const newuser = {
                ...(userFromBody || { username: "" }),
                nome: profile.nome,
                cognome: profile.cognome,
                ruolo: profile.ruolo,
                username: profile.username,
                email: profile.email,
                ultimoAccesso: profile.ultimoAccesso
            };
            console.log("ultimo accesso: ", newuser.ultimoAccesso)
            dispatch(setUser(newuser));

            navigate("/dashboard");
        },
        onError: (errore: any) => {
            showSnackbar(errore.response?.data?.message || "Errore durante la registrazione.", "error");
        },
    });

    const onSubmit = (data: FormData) => mutation.mutate(data);

    return (
        <Grid container alignItems="center" style={{ minHeight: "80vh", backgroundColor: "#f5f5f5" }}>
            <Grid size={{xs:false, sm:false, md:1, lg:4}}></Grid>
            <Grid size={{xs:12, sm:11, md:10, lg:4}}>
                <Typography variant="h3" sx={{ marginTop: 2, textAlign: "center", color: "blue", fontFamily: "Arial", fontWeight: "bold" }}>
                    My Fin Bank
                </Typography>
                <Card style={{margin: "20px auto 0 auto", marginTop: "20px", maxWidth: 450}}>
                <CardHeader
                    title={
                        <Typography variant="h5" align="center" fontWeight="bold">
                            Accedi a MyFinBank
                        </Typography>
                    }
                />
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            placeholder="Email o Username"
                            {...register("identifier", { required: "Inserisci email o username" })}
                            fullWidth
                            error={!!errors.identifier}
                            helperText={errors.identifier?.message}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            {...register("password", { required: "Password obbligatoria" })}
                            fullWidth
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            sx={{ mb: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Grid size={{xs:12}} style={{ textAlign: "center" }}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={mutation.isPending}
                            sx={{ mt: 2, mb: 2 }}
                        >
                            {mutation.isPending ? <CircularProgress size={24} /> : "Accedi"}
                        </Button>
                        </Grid>
                        {error && (
                            <Typography color="error" align="center" sx={{ mt: 1 }}>
                                {error}
                            </Typography>
                        )}
                        <Grid size={{xs:12}} style={{ textAlign: "center" }}>

                        <Typography align="center" sx={{ mt: 2 }}>
                            <Link
                                href="#"
                                onClick={() => navigate("/auth/register")}
                            >
                                Non hai un account? Registrati qui
                            </Link>
                        </Typography>
                        </Grid>
                        <Snackbar
                            open={snackbarOpen}
                            autoHideDuration={3000}
                            onClose={handleSnackbarClose}
                            anchorOrigin={{ vertical: "top", horizontal: "right"}}

                        >
                            <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}  sx={{
                                width: 350,            // larghezza
                                fontSize: "1.2rem",    // dimensione del testo
                                padding: "16px 24px",  // padding interno
                                boxShadow: 3,          // ombra
                                borderRadius: 2,       // angoli arrotondati
                            }}>
                                {snackbarMessage}
                            </Alert>
                        </Snackbar>
                    </form>
                </CardContent>
            </Card>
            </Grid>
        </Grid>
    );
}
