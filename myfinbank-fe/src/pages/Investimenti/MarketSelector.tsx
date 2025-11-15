import React, { type JSX } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import PublicIcon from "@mui/icons-material/Public";
import AppleIcon from "@mui/icons-material/Apple";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ElectricCarIcon from "@mui/icons-material/ElectricCar";
import GoogleIcon from "@mui/icons-material/Google";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";

type Market = {
    id: string;
    nome: string;
    rendimentoMedio?: number;
};

export default function MarketSelector({
                                           markets,
                                           register,
                                           setValue,
                                           fieldName,
                                           error,
                                       }: {
    markets: Market[];
    register: any;
    setValue: any;
    fieldName: string;
    error?: string;
}) {
    const [selected, setSelected] = React.useState<string | null>(null);

    const icons: Record<string, JSX.Element> = {
        SP500: <ShowChartIcon color="primary" />,
        WORLD: <PublicIcon color="success" />,
        AAPL: <AppleIcon color="action" />,
        MSFT: <TrendingUpIcon color="primary" />,
        TSLA: <ElectricCarIcon color="error" />,
        GOOGL: <GoogleIcon color="primary" />,
        AMZN: <TrendingUpIcon color="warning" />,
        BTC: <CurrencyBitcoinIcon color="warning" />,
    };

    const handleSelect = (symbol: string) => {
        setSelected(symbol);
        setValue(fieldName, symbol, { shouldValidate: true });
    };

    return (
        <Box>
            <input
                type="hidden"
                {...register(fieldName, { required: "Seleziona un mercato" })}
                value={selected ?? ""}
            />
            <Grid container spacing={2}>
                {markets.map((m) => (
                    <Grid key={m.id} size={{xs:12, sm:6}}>
                        <Paper
                            onClick={() => handleSelect(m.id)}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                cursor: "pointer",
                                border:
                                    selected === m.id ? "2px solid #1976d2" : "1px solid #ccc",
                                boxShadow:
                                    selected === m.id
                                        ? "0 0 10px rgba(25, 118, 210, 0.3)"
                                        : "none",
                                transition: "all 0.2s",
                                "&:hover": {
                                    transform: "scale(1.02)",
                                    boxShadow: "0 0 8px rgba(0,0,0,0.1)",
                                },
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1}>
                                {icons[m.id] ?? <ShowChartIcon color="primary" />}
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {m.nome}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                Rendimento medio stimato:{" "}
                                <strong>
                                    {(m.rendimentoMedio ?? (3 + Math.random() * 5)).toFixed(1)}%
                                </strong>
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {error}
                </Typography>
            )}
        </Box>
    );
}
