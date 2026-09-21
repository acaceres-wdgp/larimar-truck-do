import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

type ReportType = 'revenue' | 'clients' | 'drivers';

interface RevenueRow {
    label: string;
    trips: number;
    revenue: number;
    costs: number;
    margin: number;
}

interface ClientRow {
    label: string;
    trips: number;
    revenue: number;
    avg_rate: number;
}

interface DriverRow {
    label: string;
    trips: number;
    revenue: number;
    total_pay: number;
    avg_pay: number;
}

type ReportRow = RevenueRow | ClientRow | DriverRow;

interface Totals {
    trips: number;
    revenue: number;
    costs: number;
    margin: number;
}

interface ReportsProps {
    type: ReportType;
    from: string;
    to: string;
    rows: ReportRow[];
    totals: Totals;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(value: number): string {
    return 'RD$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtAvg(value: number): string {
    return 'RD$' + Math.round(value).toLocaleString('en-US');
}

function marginColor(margin: number): string {
    if (margin > 0) return '#1F5C3D';
    if (margin < 0) return '#9B1C1C';
    return '#5E7A80';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <div style={{
            flex: 1,
            minWidth: 0,
            background: '#FFFFFF',
            border: '1px solid #E0EBED',
            borderRadius: '14px',
            padding: '18px 22px',
        }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#5E7A80', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                {label}
            </div>
            <div style={{ fontFamily: "'Bitter', Georgia, serif", fontSize: '26px', fontWeight: 700, color: '#123238', lineHeight: 1 }}>
                {value}
            </div>
            {sub && <div style={{ fontSize: '12px', color: '#9DB3B8', marginTop: '5px' }}>{sub}</div>}
        </div>
    );
}

// ── Tables ────────────────────────────────────────────────────────────────────

function RevenueTable({ rows }: { rows: RevenueRow[] }) {
    if (!rows.length) return <EmptyState />;
    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#F5F9FA' }}>
                        <th style={thStyle}>Mes</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Viajes</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Ingresos</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Costos</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Margen</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i} onMouseEnter={e => (e.currentTarget.style.background = '#F5F9FA')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                            <td style={{ ...tdStyle, fontWeight: 500, color: '#123238' }}>{r.label}</td>
                            <td style={{ ...tdStyle, textAlign: 'right', color: '#5E7A80' }}>{r.trips}</td>
                            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: '#123238' }}>{fmt(r.revenue)}</td>
                            <td style={{ ...tdStyle, textAlign: 'right', color: '#5E7A80' }}>{fmt(r.costs)}</td>
                            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: marginColor(r.margin) }}>{fmt(r.margin)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ClientsTable({ rows }: { rows: ClientRow[] }) {
    if (!rows.length) return <EmptyState />;
    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#F5F9FA' }}>
                        <th style={thStyle}>Cliente</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Viajes</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Ingresos</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Promedio / viaje</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i} onMouseEnter={e => (e.currentTarget.style.background = '#F5F9FA')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                            <td style={{ ...tdStyle, fontWeight: 500, color: '#123238' }}>{r.label}</td>
                            <td style={{ ...tdStyle, textAlign: 'right', color: '#5E7A80' }}>{r.trips}</td>
                            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: '#123238' }}>{fmt(r.revenue)}</td>
                            <td style={{ ...tdStyle, textAlign: 'right', color: '#5E7A80' }}>{fmtAvg(r.avg_rate)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function DriversTable({ rows }: { rows: DriverRow[] }) {
    if (!rows.length) return <EmptyState />;
    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#F5F9FA' }}>
                        <th style={thStyle}>Chofer</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Viajes</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Ingresos</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Pago total</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Pago promedio</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i} onMouseEnter={e => (e.currentTarget.style.background = '#F5F9FA')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                            <td style={{ ...tdStyle, fontWeight: 500, color: '#123238' }}>{r.label}</td>
                            <td style={{ ...tdStyle, textAlign: 'right', color: '#5E7A80' }}>{r.trips}</td>
                            <td style={{ ...tdStyle, textAlign: 'right', color: '#5E7A80' }}>{fmt(r.revenue)}</td>
                            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: '#123238' }}>{fmt(r.total_pay)}</td>
                            <td style={{ ...tdStyle, textAlign: 'right', color: '#5E7A80' }}>{fmtAvg(r.avg_pay)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function EmptyState() {
    return (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9DB3B8', fontSize: '14px' }}>
            Sin datos para el período seleccionado.
        </div>
    );
}

// ── Report tabs config ────────────────────────────────────────────────────────

const TABS: { key: ReportType; label: string; desc: string }[] = [
    { key: 'revenue', label: 'Ingresos',  desc: 'Ingresos mensuales, costos y margen' },
    { key: 'clients', label: 'Clientes',  desc: 'Desglose de ingresos por cliente' },
    { key: 'drivers', label: 'Choferes',  desc: 'Viajes y pagos por chofer' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Reports({ type, from, to, rows, totals }: ReportsProps) {
    const [fromVal, setFromVal] = useState(from);
    const [toVal, setToVal]     = useState(to);
    const [activeTab, setActiveTab] = useState<ReportType>(type);

    function runReport(newType?: ReportType) {
        const t = newType ?? activeTab;
        router.get('/reports', { type: t, from: fromVal, to: toVal }, { preserveScroll: true });
    }

    function switchTab(t: ReportType) {
        setActiveTab(t);
        router.get('/reports', { type: t, from: fromVal, to: toVal }, { preserveScroll: true });
    }

    const activeTab_ = type; // use server-confirmed type for rendering

    return (
        <>
            <Head title="Reportes" />

            {/* KPI summary */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <KpiCard label="Viajes" value={String(totals.trips)} sub="En el período" />
                <KpiCard label="Ingresos" value={fmt(totals.revenue)} sub="Total facturado" />
                <KpiCard label="Costos" value={fmt(totals.costs)} sub="Pago a choferes + combustible + peajes" />
                <KpiCard
                    label="Margen"
                    value={fmt(totals.margin)}
                    sub={totals.revenue > 0
                        ? `${Math.round((totals.margin / totals.revenue) * 100)}% de los ingresos`
                        : undefined}
                />
            </div>

            {/* Main card */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E0EBED', borderRadius: '14px', overflow: 'hidden' }}>

                {/* Toolbar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: '1px solid #E0EBED',
                    flexWrap: 'wrap',
                    gap: '12px',
                }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {TABS.map(tab => {
                            const active = tab.key === activeTab_;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => switchTab(tab.key)}
                                    style={{
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        border: 'none',
                                        background: active ? '#1a4e57' : 'transparent',
                                        color: active ? '#FFFFFF' : '#5E7A80',
                                        fontSize: '13px',
                                        fontWeight: active ? 600 : 400,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Date range + run */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <label style={{ fontSize: '12px', color: '#5E7A80' }}>Desde</label>
                        <input
                            type="date"
                            value={fromVal}
                            onChange={e => setFromVal(e.target.value)}
                            style={dateInputStyle}
                        />
                        <label style={{ fontSize: '12px', color: '#5E7A80' }}>Hasta</label>
                        <input
                            type="date"
                            value={toVal}
                            onChange={e => setToVal(e.target.value)}
                            style={dateInputStyle}
                        />
                        <button
                            onClick={() => runReport()}
                            style={{
                                padding: '7px 16px',
                                background: '#1a4e57',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            Consultar
                        </button>
                    </div>
                </div>

                {/* Table */}
                {activeTab_ === 'revenue' && <RevenueTable rows={rows as RevenueRow[]} />}
                {activeTab_ === 'clients' && <ClientsTable rows={rows as ClientRow[]} />}
                {activeTab_ === 'drivers' && <DriversTable rows={rows as DriverRow[]} />}
            </div>
        </>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 600,
    color: '#5E7A80',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #E0EBED',
    whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid #F0F4F5',
    fontSize: '13px',
    color: '#2c2c2c',
};

const dateInputStyle: React.CSSProperties = {
    padding: '6px 10px',
    border: '1px solid #DCE8EA',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#123238',
    background: '#FAFCFC',
    outline: 'none',
};
