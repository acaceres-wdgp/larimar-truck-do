import { Head } from '@inertiajs/react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface BillingPoint {
    month: string;
    total: number;
}

interface DashboardProps {
    tripsToday: number;
    tripsThisMonth: number;
    billedThisMonth: number;
    billingLast6Months: BillingPoint[];
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
    label: string;
    value: string;
    sub?: string;
}

function KpiCard({ label, value, sub }: KpiCardProps) {
    return (
        <div
            style={{
                flex: 1,
                minWidth: 0,
                background: '#FFFFFF',
                border: '1px solid #E0EBED',
                borderRadius: '14px',
                padding: '20px 24px',
            }}
        >
            <div
                style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#5E7A80',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '10px',
                }}
            >
                {label}
            </div>
            <div
                style={{
                    fontFamily: "'Bitter', Georgia, serif",
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#123238',
                    lineHeight: 1,
                }}
            >
                {value}
            </div>
            {sub && (
                <div
                    style={{
                        fontSize: '12px',
                        color: '#9DB3B8',
                        marginTop: '6px',
                    }}
                >
                    {sub}
                </div>
            )}
        </div>
    );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: '#FFFFFF',
                border: '1px solid #E0EBED',
                borderRadius: '10px',
                padding: '10px 14px',
                boxShadow: '0 4px 16px rgba(18,50,56,0.10)',
                fontSize: '13px',
                color: '#123238',
            }}
        >
            <div style={{ color: '#5E7A80', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontWeight: 600 }}>
                RD${payload[0].value.toLocaleString('en-US')}
            </div>
        </div>
    );
}

// ─── Dashboard page ────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
    if (value >= 1_000_000) {
        return `RD$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
        return `RD$${Math.round(value / 1_000)}K`;
    }
    return `RD$${value}`;
}

function formatYAxis(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
    return String(value);
}

export default function Dashboard({
    tripsToday = 0,
    tripsThisMonth = 0,
    billedThisMonth = 0,
    billingLast6Months = [],
}: DashboardProps) {
    const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const now = new Date();
    const monthName = MONTHS_ES[now.getMonth()];

    return (
        <>
            <Head title="Panel" />

            {/* KPI cards */}
            <div
                style={{
                    display: 'flex',
                    gap: '16px',
                    flexWrap: 'wrap',
                    marginBottom: '20px',
                }}
            >
                <KpiCard
                    label="Viajes hoy"
                    value={String(tripsToday)}
                    sub="Programados para hoy"
                />
                <KpiCard
                    label="Viajes este mes"
                    value={String(tripsThisMonth)}
                    sub={monthName}
                />
                <KpiCard
                    label="Facturado este mes"
                    value={formatCurrency(billedThisMonth)}
                    sub={`Ingresos de ${monthName}`}
                />
            </div>

            {/* Revenue chart */}
            <div
                style={{
                    background: '#FFFFFF',
                    border: '1px solid #E0EBED',
                    borderRadius: '14px',
                    padding: '24px',
                }}
            >
                <div
                    style={{
                        fontFamily: "'Bitter', Georgia, serif",
                        fontWeight: 600,
                        fontSize: '15px',
                        color: '#123238',
                        marginBottom: '4px',
                    }}
                >
                    Ingresos
                </div>
                <div
                    style={{
                        fontSize: '12px',
                        color: '#5E7A80',
                        marginBottom: '24px',
                    }}
                >
                    Últimos 6 meses
                </div>

                <ResponsiveContainer width="100%" height={240}>
                    <LineChart
                        data={billingLast6Months}
                        margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="4 4"
                            stroke="#EFF5F6"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12, fill: '#5E7A80' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tickFormatter={formatYAxis}
                            tick={{ fontSize: 12, fill: '#5E7A80' }}
                            axisLine={false}
                            tickLine={false}
                            width={52}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke="#1a4e57"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: '#1a4e57', strokeWidth: 0 }}
                            activeDot={{
                                r: 6,
                                fill: '#1a4e57',
                                strokeWidth: 0,
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </>
    );
}
