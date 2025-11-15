import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    Box,
    Typography,
    Select,
    MenuItem,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    CircularProgress,
} from "@mui/material";
import {getMarketData, getSupportedSymbols, type MarketData} from "./api.ts";

const periods = [
    { label: "Ultimi 7 giorni", value: 7 },
    { label: "Ultimi 30 giorni", value: 30 },
    { label: "Ultimi 90 giorni", value: 90 },
];

const InvestmentDashboard = () => {
    const [symbols, setSymbols] = useState<string[]>([]);
    const [selectedSymbols, setSelectedSymbols] = useState<string[]>(["SP500", "WORLD", "BTC"]);
    const [days, setDays] = useState<number>(30);
    const [data, setData] = useState<Record<string, MarketData[]>>({});
    const [loading, setLoading] = useState(false);

    // Carica simboli disponibili
    useEffect(() => {
        getSupportedSymbols().then((res) => setSymbols(res));
    }, []);

    // Carica i dati di mercato
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            const result: Record<string, MarketData[]> = {};
            for (const symbol of selectedSymbols) {
                const res = await getMarketData(symbol);
                result[symbol] = res.slice(-days); // ultimi N giorni
            }
            setData(result);
            setLoading(false);
        };
        fetchAll();
    }, [selectedSymbols, days]);

    // Calcola rendimento percentuale
    const getChangePercent = (series: MarketData[]): number => {
        if (series.length < 2) return 0;
        const first = series[0].close;
        const last = series[series.length - 1].close;
        return ((last - first) / first) * 100;
    };

    // Prepara dati per Recharts
    const chartData = (() => {
        if (Object.keys(data).length === 0) return [];
        const dates = [...new Set(Object.values(data).flat().map((d) => d.date))];
        return dates.map((date) => {
            const entry: any = { date };
            for (const symbol of selectedSymbols) {
                const point = data[symbol]?.find((d) => d.date === date);
                entry[symbol] = point?.close ?? null;
            }
            return entry;
        });
    })();

    if (loading) {
        return (
            <Box sx={{ textAlign: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                <Typography>Periodo:</Typography>
                <Select value={days} onChange={(e) => setDays(e.target.value as number)} size="small">
                    {periods.map((p) => (
                        <MenuItem key={p.value} value={p.value}>
                            {p.label}
                        </MenuItem>
                    ))}
                </Select>

                <Typography>Mercati:</Typography>
                <Select
                    multiple
                    size="small"
                    value={selectedSymbols}
                    onChange={(e) => setSelectedSymbols(e.target.value as string[])}
                    sx={{ minWidth: 200 }}
                >
                    {symbols.map((s) => (
                        <MenuItem key={s} value={s}>
                            {s}
                        </MenuItem>
                    ))}
                </Select>
            </Box>

            <Paper sx={{ p: 2, height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {selectedSymbols.map((symbol, i) => (
                            <Line
                                key={symbol}
                                type="monotone"
                                dataKey={symbol}
                                stroke={`hsl(${i * 60}, 70%, 50%)`}
                                strokeWidth={2}
                                dot={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </Paper>

            {/* TABELLA RIEPILOGO RENDIMENTI */}
            <Paper sx={{ mt: 3, p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Rendimento negli ultimi {days} giorni
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mercato</TableCell>
                            <TableCell align="right">Apertura iniziale</TableCell>
                            <TableCell align="right">Chiusura finale</TableCell>
                            <TableCell align="right">Variazione %</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {selectedSymbols.map((symbol) => {
                            const series = data[symbol] ?? [];
                            const change = getChangePercent(series);
                            const start = series[0]?.close?.toFixed(2) ?? "-";
                            const end = series[series.length - 1]?.close?.toFixed(2) ?? "-";
                            return (
                                <TableRow key={symbol}>
                                    <TableCell>{symbol}</TableCell>
                                    <TableCell align="right">{start}</TableCell>
                                    <TableCell align="right">{end}</TableCell>
                                    <TableCell
                                        align="right"
                                        sx={{
                                            color: change > 0 ? "success.main" : change < 0 ? "error.main" : "text.primary",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {change.toFixed(2)}%
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export default InvestmentDashboard;
