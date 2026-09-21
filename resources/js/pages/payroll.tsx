import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

interface PayrollRunRow {
    id: number;
    period_start: string;
    period_end: string;
    status: 'draft' | 'approved' | 'paid';
    total_amount: number;
    items_count: number;
    approved_at: string | null;
    paid_at: string | null;
}

interface PayrollIndexProps {
    totalPending: number;
    driversPending: number;
    lastRunDate: string | null;
    runs: PayrollRunRow[];
}

const MONTHS_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatDate(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatPeriod(start: string, end: string): string {
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    const sm = MONTHS_SHORT[s.getMonth()];
    const em = MONTHS_SHORT[e.getMonth()];
    const sy = s.getFullYear();
    const ey = e.getFullYear();
    if (sy === ey && sm === em) {
        return `${sm} ${s.getDate()} – ${e.getDate()}, ${ey}`;
    }
    if (sy === ey) {
        return `${sm} ${s.getDate()} – ${em} ${e.getDate()}, ${ey}`;
    }
    return `${sm} ${s.getDate()}, ${sy} – ${em} ${e.getDate()}, ${ey}`;
}

const STATUS_COLORS: Record<string, { bg: string; fg: string; dot: string }> = {
    draft:    { bg: '#F0EFEF', fg: '#595959', dot: '#9B9B9B' },
    approved: { bg: '#EAF2FA', fg: '#2C4E72', dot: '#5B84B1' },
    paid:     { bg: '#E6F4EC', fg: '#1F5C3D', dot: '#2E8055' },
};

function StatusChip({ status }: { status: string }) {
    const c = STATUS_COLORS[status] ?? STATUS_COLORS['draft'];
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: c.bg,
            color: c.fg,
            borderRadius: '20px',
            padding: '3px 10px',
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
        }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
            {{ draft: 'Borrador', approved: 'Aprobado', paid: 'Pagado' }[status] ?? (status.charAt(0).toUpperCase() + status.slice(1))}
        </span>
    );
}

interface KpiCardProps {
    label: string;
    value: string;
    sub?: string;
}

function KpiCard({ label, value, sub }: KpiCardProps) {
    return (
        <div style={{
            flex: 1,
            minWidth: 0,
            background: '#FFFFFF',
            border: '1px solid #E0EBED',
            borderRadius: '14px',
            padding: '20px 24px',
        }}>
            <div style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#5E7A80',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
            }}>
                {label}
            </div>
            <div style={{
                fontFamily: "'Bitter', Georgia, serif",
                fontSize: '28px',
                fontWeight: 700,
                color: '#123238',
                lineHeight: 1.1,
                marginBottom: sub ? '6px' : 0,
            }}>
                {value}
            </div>
            {sub && (
                <div style={{ fontSize: '12px', color: '#5E7A80' }}>{sub}</div>
            )}
        </div>
    );
}

const FILTER_TABS: Array<{ key: string; label: string }> = [
    { key: 'all',      label: 'Todos' },
    { key: 'draft',    label: 'Borrador' },
    { key: 'approved', label: 'Aprobado' },
    { key: 'paid',     label: 'Pagado' },
];

export default function PayrollIndex({ totalPending, driversPending, lastRunDate, runs }: PayrollIndexProps) {
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [isCompact, setIsCompact] = useState(false);

    // Responsive detection
    if (typeof window !== 'undefined') {
        // handled in effect below
    }

    const filteredRuns = activeFilter === 'all' ? runs : runs.filter(r => r.status === activeFilter);

    return (
        <>
            <Head title="Nómina" />

            {/* KPI cards */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <KpiCard
                    label="Pago pendiente"
                    value={`RD$${totalPending.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                    sub="Pagos a choferes sin procesar"
                />
                <KpiCard
                    label="Choferes pendientes"
                    value={`${driversPending}`}
                    sub="Con viajes completados sin pagar"
                />
                <KpiCard
                    label="Último ciclo de nómina"
                    value={lastRunDate ? formatDate(lastRunDate) : 'Ninguno aún'}
                    sub="Ejecución más reciente"
                />
            </div>

            {/* Runs card */}
            <div style={{
                background: '#FFFFFF',
                border: '1px solid #E0EBED',
                borderRadius: '14px',
                overflow: 'hidden',
            }}>
                {/* Card header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 24px 14px',
                    borderBottom: '1px solid #E0EBED',
                    flexWrap: 'wrap',
                    gap: '10px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                            fontFamily: "'Bitter', Georgia, serif",
                            fontSize: '17px',
                            fontWeight: 600,
                            color: '#123238',
                        }}>
                            Ciclos de nómina
                        </span>
                        <span style={{
                            background: '#EEF4F5',
                            color: '#1a4e57',
                            borderRadius: '20px',
                            padding: '2px 9px',
                            fontSize: '12px',
                            fontWeight: 600,
                        }}>
                            {runs.length}
                        </span>
                    </div>
                    <Link
                        href="/payroll/create"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#1a4e57',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: 500,
                            textDecoration: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        + Nuevo ciclo de nómina
                    </Link>
                </div>

                {/* Filter tabs */}
                <div style={{
                    display: 'flex',
                    gap: '4px',
                    padding: '10px 20px',
                    borderBottom: '1px solid #E0EBED',
                }}>
                    {FILTER_TABS.map(tab => {
                        const active = tab.key === activeFilter;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveFilter(tab.key)}
                                style={{
                                    padding: '5px 14px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: active ? '#1a4e57' : 'transparent',
                                    color: active ? '#FFFFFF' : '#5E7A80',
                                    fontSize: '13px',
                                    fontWeight: active ? 600 : 400,
                                    cursor: 'pointer',
                                    transition: 'background 0.12s',
                                }}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Table */}
                {filteredRuns.length === 0 ? (
                    <div style={{
                        padding: '48px 24px',
                        textAlign: 'center',
                        color: '#9DB3B8',
                        fontSize: '14px',
                    }}>
                        No se encontraron ciclos de nómina.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#F5F9FA' }}>
                                    <th style={thStyle}>Período</th>
                                    <th style={thStyle}>Choferes</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
                                    <th style={thStyle}>Estado</th>
                                    <th style={thStyle}>Aprobado</th>
                                    <th style={thStyle}>Pagado</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRuns.map(run => (
                                    <tr
                                        key={run.id}
                                        onClick={() => window.location.href = `/payroll/${run.id}`}
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'background 0.1s',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#F5F9FA')}
                                        onMouseLeave={e => (e.currentTarget.style.background = '')}
                                    >
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: 500, color: '#123238' }}>
                                                {formatPeriod(run.period_start, run.period_end)}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ color: '#5E7A80' }}>{run.items_count}</span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                                            <span style={{
                                                fontFamily: "'Bitter', Georgia, serif",
                                                fontWeight: 600,
                                                color: '#123238',
                                            }}>
                                                RD${run.total_amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <StatusChip status={run.status} />
                                        </td>
                                        <td style={{ ...tdStyle, color: '#5E7A80' }}>
                                            {run.approved_at ? formatDate(run.approved_at) : '—'}
                                        </td>
                                        <td style={{ ...tdStyle, color: '#5E7A80' }}>
                                            {run.paid_at ? formatDate(run.paid_at) : '—'}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                                            <Link
                                                href={`/payroll/${run.id}`}
                                                onClick={e => e.stopPropagation()}
                                                style={{
                                                    display: 'inline-block',
                                                    padding: '5px 14px',
                                                    background: '#EEF4F5',
                                                    color: '#1a4e57',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                Ver
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

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
    padding: '13px 16px',
    borderBottom: '1px solid #F0F4F5',
    fontSize: '13px',
    color: '#2c2c2c',
};
