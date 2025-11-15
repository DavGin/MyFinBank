import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    Select,
    MenuItem,
    Link,
    FormHelperText,
    InputAdornment,
    IconButton,
    Tooltip,
    CircularProgress,
    Snackbar,
    Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {registrazione, type Registrazione} from "../../api/authApi";
import "../../theme/page.css";

// Regex validazione
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const codiceFiscaleRegex = /^[a-zA-Z]{6}[0-9]{2}[a-zA-Z][0-9]{2}[a-zA-Z][0-9]{3}[a-zA-Z]$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


// Schema Yup
const validationSchema = yup.object({
    giorno: yup.number().required("Il giorno è obbligatorio"),
    mese: yup.number().required("Il mese è obbligatorio"),
    anno: yup.number().required("L'anno è obbligatorio"),
    nome: yup.string().required("Il nome è obbligatorio"),
    cognome: yup.string().required("Il cognome è obbligatorio"),
    username: yup.string().required("Username è obbligatorio"),
    codiceFiscale: yup.string().matches(codiceFiscaleRegex, "Codice fiscale non valido").required("Il codice fiscale è obbligatorio"),
    email: yup.string().matches(emailRegex, "Inserisci un'email valida").required("L'email è obbligatoria"),
    telefono: yup.string().required("Il numero di telefono è obbligatorio"),
    password: yup.string()
        .min(6, "La password deve contenere almeno 6 caratteri")
        .matches(passwordRegex, "La password deve contenere almeno una lettera maiuscola, una minuscola, un numero e un carattere speciale")
        .required("La password è obbligatoria"),
    confermaPassword: yup.string()
        .oneOf([yup.ref("password"), undefined], "Le password non coincidono")
        .required("La conferma della password è obbligatoria"),
})
    .test(
        "data-valida",
        "Data non valida o devi avere almeno 18 anni",
        function (values) {
            const { giorno, mese, anno } = values || {};
            if (!giorno || !mese || !anno) {
                return this.createError({ path: "giorno", message: "Data non valida" });
            }

            const data = new Date(anno, mese - 1, giorno);
            if (
                data.getFullYear() !== anno ||
                data.getMonth() !== mese - 1 ||
                data.getDate() !== giorno
            ) {
                return this.createError({ path: "giorno", message: "Data non valida" });
            }

            // Controllo età >= 18
            const oggi = new Date();
            let age = oggi.getFullYear() - data.getFullYear();
            const m = oggi.getMonth() - data.getMonth();
            if (m < 0 || (m === 0 && oggi.getDate() < data.getDate())) {
                age--;
            }

            if (age < 18) {
                return this.createError({ path: "anno", message: "Devi avere almeno 18 anni" });
            }

            // dataN = data; // salva data valida globale
            return true;
        }
    );
// Liste dinamiche
const giorni = Array.from({ length: 31 }, (_, i) => i + 1);
const mesi = [
    { value: 1, label: "Gennaio" }, { value: 2, label: "Febbraio" }, { value: 3, label: "Marzo" },
    { value: 4, label: "Aprile" }, { value: 5, label: "Maggio" }, { value: 6, label: "Giugno" },
    { value: 7, label: "Luglio" }, { value: 8, label: "Agosto" }, { value: 9, label: "Settembre" },
    { value: 10, label: "Ottobre" }, { value: 11, label: "Novembre" }, { value: 12, label: "Dicembre" },
];
const anni = Array.from({ length: 125 }, (_, i) => new Date().getFullYear() - i);

type FormData = {
    nome: string,
    cognome: string,
    username: string,
    giorno: number,
    mese: number,
    anno: number,
    codiceFiscale: string,
    email: string,
    telefono: string,
    password: string,
    confermaPassword: string,
};

export default function RegistrationForm() {
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

    const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            nome: "",
            cognome: "",
            username: "",
            giorno: 1,
            mese: 1,
            anno: new Date().getFullYear(),
            codiceFiscale: "",
            email: "",
            telefono: "",
            password: "",
            confermaPassword: "",
        },
    });

    const mutation = useMutation<Registrazione, unknown, FormData>({
        mutationFn: async (data: FormData) => {
            // Formatta dataN in ISO
            const giorno = String(data.giorno).padStart(2, "0");
            const mese = String(data.mese + 1).padStart(2, "0");
            const anno = data.anno;
            const dataFormattata = `${anno}-${mese}-${giorno}`;

            const reg: Registrazione = {
                nome: data.nome,
                cognome: data.cognome,
                username: data.username,
                codiceFiscale: data.codiceFiscale,
                email: data.email,
                telefono: data.telefono,
                password: data.password,
                dataNascita: dataFormattata,
            };
            return registrazione(reg);
        },
        onSuccess: () => {
            console.log("Registrazione completata con successo! Ora puoi accedere.");
            showSnackbar("Registrazione completata con successo!", "success");
            setTimeout(() => navigate("/auth/login"), 3000); // chiudi e naviga dopo 1,5s
        },
        onError: (err: any) => {
            console.error("Errore backend:", err.response?.data);
            showSnackbar(err.response?.data?.message || "Errore durante la registrazione.", "error");
        },
    });

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault();
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    return (
        <Grid container alignItems="center" style={{ minHeight: "90vh", backgroundColor: "#f5f5f5" }}>
            <Grid size={{xs:false, sm:false, md:1, lg:4}}></Grid>
            <Grid size={{xs:12, sm:11, md:10, lg:4}}>
                <Typography variant="h3" sx={{ marginTop: 2, textAlign: "center", color: "blue", fontFamily: "Arial", fontWeight: "bold" }}>
                    My Fin Bank
                </Typography>
                <Card style={{ marginTop: "20px" }}>
                    <CardHeader
                        title={<Typography variant="h5" align="center" fontWeight="bold">Registrati a MyFinBank</Typography>}
                    />
                    <CardContent>
                        <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
                            <Grid container spacing={1}>
                                {/* Nome e Cognome */}
                                <Grid  size={{xs:6}}>
                                    <Tooltip
                                        title={errors.nome?.message || ""}
                                        open={!!errors.nome}
                                        arrow
                                        placement="left"
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    bgcolor: "red",  // sfondo del tooltip
                                                    color: "white",  // colore del testo
                                                    fontSize: "0.9rem",
                                                },
                                            },
                                            arrow: {
                                                sx: {
                                                    color: "red",    // colore della freccia (stesso dello sfondo)
                                                },
                                            },
                                        }}
                                    >
                                        <TextField fullWidth placeholder="Nome" {...register("nome")} error={!!errors.nome} />
                                    </Tooltip>
                                </Grid>
                                <Grid  size={{xs:6}}>
                                    <Tooltip
                                        title={errors.cognome?.message || ""}
                                        open={!!errors.cognome}
                                        arrow
                                        placement="right"
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    bgcolor: "red",  // sfondo del tooltip
                                                    color: "white",  // colore del testo
                                                    fontSize: "0.9rem",
                                                },
                                            },
                                            arrow: {
                                                sx: {
                                                    color: "red",    // colore della freccia (stesso dello sfondo)
                                                },
                                            },
                                        }}
                                    >
                                        <TextField fullWidth placeholder="Cognome" {...register("cognome")} error={!!errors.cognome} />
                                    </Tooltip>
                                </Grid>

                                {/* Data di nascita */}
                                <Grid  size={{xs:12}}>
                                    <Typography variant="h6" sx={{ fontSize: "13px", fontFamily: "Arial" }}>Data di Nascita</Typography></Grid>
                                <Grid  size={{xs:4}}>
                                    <FormControl fullWidth error={!!errors.giorno}>
                                        <Controller
                                            name="giorno"
                                            control={control}
                                            render={({ field }) => (
                                                <Tooltip
                                                    title={errors.giorno?.message || ""}
                                                    open={!!errors.giorno}
                                                    arrow
                                                    placement="left"
                                                    componentsProps={{
                                                        tooltip: {
                                                            sx: { bgcolor: "red", color: "white", fontSize: "0.9rem" },
                                                        },
                                                        arrow: {
                                                            sx: { color: "red" },
                                                        },
                                                    }}
                                                >
                                                    <Select
                                                        {...field}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                style: {
                                                                    maxHeight: 150, // altezza massima visibile
                                                                    overflowY: 'auto', // aggiunge la barra di scorrimento
                                                                },
                                                            },
                                                        }}
                                                    >
                                                        {giorni.map((g) => (
                                                            <MenuItem key={g} value={g}>
                                                                {g}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </Tooltip>
                                            )}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid  size={{xs:4}}>
                                    <FormControl fullWidth error={!!errors.mese}>
                                        <Controller
                                            name="mese"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            style: {
                                                                maxHeight: 150, // altezza massima visibile
                                                                overflowY: 'auto', // aggiunge la barra di scorrimento
                                                            },
                                                        },
                                                    }}
                                                >
                                                    {mesi.map((m) => (
                                                        <MenuItem key={m.value} value={m.value}>
                                                            {m.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            )}
                                        />
                                        <FormHelperText>{errors.mese?.message}</FormHelperText>
                                    </FormControl>
                                </Grid>
                                <Grid size={{xs:4}}>
                                    <FormControl fullWidth error={!!errors.anno}>
                                        <Controller
                                            name="anno"
                                            control={control}
                                            render={({ field }) => (
                                                <Tooltip
                                                    title={errors.anno?.message || ""}
                                                    open={!!errors.anno}
                                                    arrow
                                                    placement="right"
                                                    componentsProps={{
                                                        tooltip: {
                                                            sx: { bgcolor: "red", color: "white", fontSize: "0.9rem" },
                                                        },
                                                        arrow: {
                                                            sx: { color: "red" },
                                                        },
                                                    }}
                                                >
                                                    <Select
                                                        {...field}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                style: {
                                                                    maxHeight: 150, // altezza massima visibile
                                                                    overflowY: 'auto', // aggiunge la barra di scorrimento
                                                                },
                                                            },
                                                        }}
                                                    >
                                                        {anni.map((a) => (
                                                            <MenuItem key={a} value={a}>
                                                                {a}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </Tooltip>
                                            )}
                                        />
                                    </FormControl>
                                </Grid>

                                {/* Codice fiscale */}
                                <Grid size={{xs:12}}>
                                    <Tooltip
                                        title={errors.codiceFiscale?.message || ""}
                                        open={!!errors.codiceFiscale}
                                        arrow
                                        placement="right"
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    bgcolor: "red",  // sfondo del tooltip
                                                    color: "white",  // colore del testo
                                                    fontSize: "0.9rem",
                                                },
                                            },
                                            arrow: {
                                                sx: {
                                                    color: "red",    // colore della freccia (stesso dello sfondo)
                                                },
                                            },
                                        }}
                                    >
                                        <TextField  placeholder="Codice Fiscale" sx={{width: '35ch' }} {...register("codiceFiscale")} error={!!errors.codiceFiscale} />
                                    </Tooltip>
                                </Grid>

                                {/* Email e Telefono */}
                                <Grid size={{xs:6}}>
                                    <Tooltip
                                        title={errors.email?.message || ""}
                                        open={!!errors.email}
                                        arrow
                                        placement="left"
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    bgcolor: "red",  // sfondo del tooltip
                                                    color: "white",  // colore del testo
                                                    fontSize: "0.9rem",
                                                },
                                            },
                                            arrow: {
                                                sx: {
                                                    color: "red",    // colore della freccia (stesso dello sfondo)
                                                },
                                            },
                                        }}
                                    >
                                        <TextField fullWidth placeholder="Email" {...register("email")} error={!!errors.email} />
                                    </Tooltip>
                                </Grid>
                                <Grid size={{xs:6}}>
                                    <Tooltip
                                        title={errors.telefono?.message || ""}
                                        open={!!errors.telefono}
                                        arrow
                                        placement="right"
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    bgcolor: "red",  // sfondo del tooltip
                                                    color: "white",  // colore del testo
                                                    fontSize: "0.9rem",
                                                },
                                            },
                                            arrow: {
                                                sx: {
                                                    color: "red",    // colore della freccia (stesso dello sfondo)
                                                },
                                            },
                                        }}
                                    >
                                        <TextField fullWidth placeholder="Telefono" {...register("telefono")} error={!!errors.telefono} />
                                    </Tooltip>
                                </Grid>

                                {/* Username */}
                                <Grid size={{xs:12}}>
                                    <Tooltip
                                        title={errors.username?.message || ""}
                                        open={!!errors.username}
                                        arrow
                                        placement="right"
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    bgcolor: "red",  // sfondo del tooltip
                                                    color: "white",  // colore del testo
                                                    fontSize: "0.9rem",
                                                },
                                            },
                                            arrow: {
                                                sx: {
                                                    color: "red",    // colore della freccia (stesso dello sfondo)
                                                },
                                            },
                                        }}
                                    >
                                        <TextField fullWidth placeholder="Username" sx={{width: '35ch' }} {...register("username")} error={!!errors.username} />
                                    </Tooltip>
                                </Grid>

                                {/* Password e Conferma Password */}
                                <Grid size={{xs:6}}>
                                    <Tooltip
                                        title={errors.password?.message || ""}
                                        open={!!errors.password}
                                        arrow
                                        placement="left"
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    bgcolor: "red",  // sfondo del tooltip
                                                    color: "white",  // colore del testo
                                                    fontSize: "0.9rem",
                                                },
                                            },
                                            arrow: {
                                                sx: {
                                                    color: "red",    // colore della freccia (stesso dello sfondo)
                                                },
                                            },
                                        }}
                                    >
                                        <TextField
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            {...register("password")}
                                            fullWidth
                                            error={!!errors.password}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}>
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Tooltip>
                                </Grid>
                                <Grid size={{xs:6}}>
                                    <Tooltip
                                        title={errors.confermaPassword?.message || ""}
                                        open={!!errors.confermaPassword}
                                        arrow
                                        placement="right"
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    bgcolor: "red",  // sfondo del tooltip
                                                    color: "white",  // colore del testo
                                                    fontSize: "0.9rem",
                                                },
                                            },
                                            arrow: {
                                                sx: {
                                                    color: "red",    // colore della freccia (stesso dello sfondo)
                                                },
                                            },
                                        }}
                                    >
                                        <TextField
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Conferma Password"
                                            {...register("confermaPassword")}
                                            fullWidth
                                            error={!!errors.confermaPassword}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}>
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Tooltip>
                                </Grid>

                                {/* Submit */}
                                <Grid size={{xs:12}} style={{ textAlign: "center" }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={mutation.isPending}
                                        sx={{ mt: 2, mb: 2 }}
                                    >
                                        {mutation.isPending ? <CircularProgress size={24} /> : "Registrati"}
                                    </Button>
                                </Grid>

                                {/* Link login */}
                                <Grid size={{xs:12}} style={{ textAlign: "center" }}>
                                    <Link href="#" underline="always" onClick={() => navigate("/auth/login")} variant="body2" color="primary">
                                        Hai già un account? Accedi qui
                                    </Link>
                                </Grid>
                            </Grid>
                            {error && <Typography id="modal-modal-description" color="error" style={{ textAlign: "center", marginTop: 10 }}>{error}</Typography>}

                        </form>
                        <Snackbar
                            open={snackbarOpen}
                            autoHideDuration={3000} // durata in ms (3 secondi)
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
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs:false, sm:false, md:1, lg:4}}></Grid>
        </Grid>
    );
}
