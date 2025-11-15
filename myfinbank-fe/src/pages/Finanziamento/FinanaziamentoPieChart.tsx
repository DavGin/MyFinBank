import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type {Rata} from '../../features/Finanziamenti/api'

const COLORS = {
    PAGATO: '#4caf50',   // verde
    DA_PAGARE: '#ff9800', // arancione
    SCADUTO: '#f44336'   // rosso
}

interface Props {
    rate: Rata[]
}

export default function FinanaziamentoPieChart({ rate }: Props) {
    const counts = {
        PAGATO: rate.filter(r => r.statoRata === 'PAGATO').length,
        DA_PAGARE: rate.filter(r => r.statoRata === 'DA_PAGARE').length,
        SCADUTO: rate.filter(r => r.statoRata === 'SCADUTO').length
    }

    const data = [
        { name: 'Pagato', value: counts.PAGATO, stato: 'PAGATO' },
        { name: 'Da Pagare', value: counts.DA_PAGARE, stato: 'DA_PAGARE' },
        { name: 'Scaduto', value: counts.SCADUTO, stato: 'SCADUTO' }
    ]

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                    >
                        {data.map((entry) => (
                            <Cell key={entry.stato} fill={COLORS[entry.stato as keyof typeof COLORS]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
