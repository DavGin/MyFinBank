import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {useMutation} from "@tanstack/react-query";
import {
    createTransazione,
    type CreateTransactionInput,
    type Transazioni
} from "../../features/transazioni/api.ts";
import {
    Box,
    Typography,
    Snackbar,
    Alert,
    FormControl,
    Select,
    MenuItem,
    FormHelperText,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,

} from "@mui/material";
import {useEffect, useState} from "react";
import { useAppSelector } from "../../app/hooks.ts";

type CreateTransactionFormValues = {
    tipoTransazione: "BONIFICO" | "DEPOSITO" | "PRELIEVO" | "";
    numeroConto: string;
    importo: number;
    valuta: string;
    descrizione: string;
    targetIban?: string;
};

const schema: yup.ObjectSchema<CreateTransactionFormValues> = yup.object({
    tipoTransazione: yup
        .mixed<"BONIFICO" | "DEPOSITO" | "PRELIEVO" | "">()
        .oneOf(["BONIFICO", "DEPOSITO", "PRELIEVO"], "Seleziona il tipo di operazione")
        .required("Campo obbligatorio"),
    numeroConto: yup.string().required("Seleziona un conto"),
    importo: yup
        .number()
        .typeError("Inserisci un numero valido")
        .positive("L'importo deve essere positivo")
        .required("Importo obbligatorio"),
    valuta: yup.string().required(),
    descrizione: yup.string().required("Inserisci una descrizione"),
    targetIban: yup
        .string()
        .when("tipoTransazione", {
            is: "BONIFICO",
            then: (schema) =>
                schema
                    .required("IBAN obbligatorio")
                    .matches(/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/, "IBAN non valido"),
            otherwise: (schema) => schema.notRequired(),
        }),
});

export default function OperazioniPage() {
    const conti = useAppSelector((state) => state.auth.conti);
    const user = useAppSelector((state) => state.auth.user);

    const [contoSelezionato, setContoSelezionato] = useState<any | null>(null);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });
    const [riepilogoOpen, setRiepilogoOpen] = useState(false);
    const [datiRiepilogo, setDatiRiepilogo] = useState<CreateTransactionFormValues | null>(null);

    const {
        register,
        control,
        watch,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateTransactionFormValues>({
        resolver: yupResolver(schema),
        defaultValues: {
            tipoTransazione: "",
            numeroConto: "",
            importo: 0,
            valuta: "EURO",
            descrizione: "",
            targetIban: "",
        },
    });

    const tipoTransazione = watch("tipoTransazione");
    const numeroContoSelezionato = watch("numeroConto");

    const formatIban = (value: string) => {
        return value
            .replace(/\s+/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim()
            .toUpperCase();
    };

    const mutation = useMutation<Transazioni, unknown, CreateTransactionInput>({
        mutationFn: async (data) => createTransazione(data),
        onSuccess: () => {
            setSnackbar({
                open: true,
                message: "Operazione eseguita con successo",
                severity: "success",
            });
            reset();
        },
        onError: (error: any) => {
            const msg =
                error?.response?.data?.message ||
                "Errore durante l'esecuzione dell'operazione";
            setSnackbar({ open: true, message: msg, severity: "error" });
        },
    });

    useEffect(() => {
        setContoSelezionato(
            conti?.find((c) => c.numeroConto === numeroContoSelezionato) ?? null
        );
    }, [numeroContoSelezionato, conti]);

    const onSubmit = (data: CreateTransactionFormValues) => {
        setDatiRiepilogo(data);
        setRiepilogoOpen(true);
    };


    const confermaOperazione = () => {
        if (!datiRiepilogo) return;

        const payload: CreateTransactionInput = {
            id: 0,
            importo: datiRiepilogo.importo,
            descrizione: datiRiepilogo.descrizione,
            data: new Date().toISOString(),
            dataTransazione: new Date().toISOString(),
            tipoTransazione: datiRiepilogo.tipoTransazione,
            valuta: datiRiepilogo.valuta,
            numeroConto: datiRiepilogo.numeroConto,
            targetIban:
                datiRiepilogo.tipoTransazione === "BONIFICO"
                    ? datiRiepilogo.targetIban || ""
                    : "",
        };

        mutation.mutate(payload);
        setRiepilogoOpen(false);
    };

    // @ts-ignore
    // @ts-ignore
    return (
        <Box>
            <Typography variant="h5" gutterBottom>
               NUOVA OPERAZIONE
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* --- TIPO OPERAZIONE --- */}
                <FormControl fullWidth error={!!errors.tipoTransazione}>
                    <Controller
                        name="tipoTransazione"
                        control={control}
                        render={({ field }) => (
                            <Box sx={{ gap: 2, mt: 2 }}>
                                {["BONIFICO", "DEPOSITO", "PRELIEVO"].map((tipo) => (
                                    <Button
                                        key={tipo}
                                        variant={field.value === tipo ? "contained" : "outlined"}
                                        color={field.value === tipo ? "primary" : "inherit"}
                                        onClick={() => field.onChange(tipo)}
                                        sx={{
                                            mr: 2,
                                            flex: 1,
                                            py: 1.5,
                                            fontWeight: "bold",
                                            borderRadius: 2,
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        {tipo}
                                    </Button>
                                ))}
                            </Box>
                        )}
                    />
                    {errors.tipoTransazione && (
                        <FormHelperText>{errors.tipoTransazione.message}</FormHelperText>
                    )}
                </FormControl>

                {tipoTransazione && (
                    <Typography sx={{ mt: 1, fontStyle: "italic", color: "gray" }}>
                        Operazione selezionata: {tipoTransazione}
                    </Typography>
                )}



                {/* --- SELETTORE CONTO --- */}
                <Box sx={{ mt: 4, p: 2, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
                    <Typography sx={{ mt: 1, fontStyle: "italic", color: "gray" }}>
                        {tipoTransazione === "DEPOSITO"
                            ? "Seleziona il conto su cui effettuare il deposito"
                            : tipoTransazione ==="PRELIEVO"
                                ? "Seleziona il conto da cui effettuare il prelievo"
                                : ""}
                    </Typography>
                    <FormControl fullWidth error={!!errors.numeroConto}>
                        <Controller
                            name="numeroConto"
                            control={control}
                            render={({ field }) => (
                                <Select {...field} displayEmpty>
                                    <MenuItem value="" disabled>
                                        Seleziona un conto
                                    </MenuItem>
                                    {conti?.map((conto) => (
                                        <MenuItem key={conto.numeroConto} value={conto.numeroConto}>
                                            {conto.tipo} - {conto.numeroConto} - {user?.nome}{" "}
                                            {user?.cognome}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                        {errors.numeroConto && (
                            <FormHelperText>{errors.numeroConto.message}</FormHelperText>
                        )}
                    </FormControl>
                    {contoSelezionato && (
                        <Box
                            sx={{
                                mt: 3,
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: "white",
                                border: "1px solid #ddd",
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: 2,
                                boxShadow: 1,
                            }}
                        >
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Tipo conto
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {contoSelezionato.tipo}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Numero conto
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {contoSelezionato.numeroConto}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    IBAN
                                </Typography>
                                <Typography
                                    variant="body1"
                                    fontFamily="monospace"
                                    fontWeight="bold"
                                    sx={{ wordBreak: "break-all" }}
                                >
                                    {contoSelezionato.iban}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Saldo disponibile
                                </Typography>
                                <Typography variant="body1" fontWeight="bold" color="success.main">
                                    {contoSelezionato.saldoDisponibile.toLocaleString("it-IT", {
                                        style: "currency",
                                        currency: "EUR",
                                    })}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>


                {/* --- DATI DESTINATARIO --- */}
                {tipoTransazione === "BONIFICO" && (
                    <Box sx={{ mt: 4, p: 2, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            DATI DESTINATARIO
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="IBAN"
                            {...register("targetIban")}
                            inputProps={{
                                maxLength: 31,
                            }}
                            error={!!errors.targetIban}
                            helperText={errors.targetIban?.message}
                            onChange={(e) => (e.target.value = formatIban(e.target.value))}
                        />
                    </Box>
                )}

                {/* --- IMPORTO E DESCRIZIONE --- */}
                <Box sx={{ mt: 4, p: 2, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        DATI PAGAMENTO
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="IMPORTO"
                        {...register("importo")}
                        error={!!errors.importo}
                        helperText={errors.importo?.message}
                        type="number"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">€</InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        sx={{ mt: 2 }}
                        fullWidth
                        placeholder="DESCRIZIONE"
                        {...register("descrizione")}
                        error={!!errors.descrizione}
                        helperText={errors.descrizione?.message}
                    />
                </Box>

                {/* --- BOTTONE SUBMIT/RESET --- */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        mt: 3,
                    }}
                >
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ py: 1.5, fontWeight: "bold", borderRadius: 3 }}
                        disabled={mutation.isPending}
                    >
                        Esegui operazione
                    </Button>

                    <Button
                        type="button"
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        sx={{ py: 1.5, fontWeight: "bold", borderRadius: 3 }}
                        onClick={() =>
                            reset({
                                tipoTransazione: "",
                                numeroConto: "",
                                importo: 0,
                                valuta: "EURO",
                                descrizione: "",
                                targetIban: "",
                            })
                        }
                    >
                        Reset
                    </Button>
                </Box>
            </form>

            {/* --- DIALOG RIEPILOGO --- */}
            <Dialog open={riepilogoOpen} onClose={() => setRiepilogoOpen(false)}>
                <DialogTitle>Conferma Operazione</DialogTitle>
                <DialogContent dividers>
                    {datiRiepilogo && (
                        <Box sx={{ lineHeight: 1.8 }}>
                            <Typography>
                                <b>Tipo:</b> {datiRiepilogo.tipoTransazione}
                            </Typography>
                            <Typography>
                                <b>Conto origine:</b> {datiRiepilogo.numeroConto}
                            </Typography>
                            {datiRiepilogo.tipoTransazione === "BONIFICO" && (
                                <Typography>
                                    <b>Destinatario IBAN:</b> {datiRiepilogo.targetIban}
                                </Typography>
                            )}
                            <Typography>
                                <b>Importo:</b> € {datiRiepilogo.importo.toFixed(2)}
                            </Typography>
                            <Typography>
                                <b>Descrizione:</b> {datiRiepilogo.descrizione}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRiepilogoOpen(false)}>Annulla</Button>
                    <Button
                        onClick={confermaOperazione}
                        loading={mutation.isPending}
                        variant="contained"
                        color="primary"
                    >
                        Conferma
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- SNACKBAR --- */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbar.severity}
                    sx={{
                        width: 350,
                        fontSize: "1.2rem",
                        padding: "16px 24px",
                        boxShadow: 3,
                        borderRadius: 2,
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
