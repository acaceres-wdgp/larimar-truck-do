import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface TripLine {
    id: number;
    date: string;
    client: string;
    from: string;
    to: string;
    driver_pay: number;
    rate: number;
    km: number;
}

interface PayrollItemDetail {
    id: number;
    driver_id: number | null;
    driver_name: string;
    trips_count: number;
    gross_pay: number;
    deductions: number;
    net_pay: number;
    status: string;
    paid_at: string | null;
    trips: TripLine[];
}

interface PayrollRunDetail {
    id: number;
    period_start: string;
    period_end: string;
    status: string;
    total_amount: number;
    approved_at: string | null;
    paid_at: string | null;
    notes: string | null;
    items: PayrollItemDetail[];
}

interface ShowPayrollProps {
    run: PayrollRunDetail;
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
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 600,
        }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
            {{ draft: 'Borrador', approved: 'Aprobado', paid: 'Pagado' }[status] ?? (status.charAt(0).toUpperCase() + status.slice(1))}
        </span>
    );
}

export default function ShowPayroll({ run: initialRun }: ShowPayrollProps) {
    const [run, setRun] = useState(initialRun);
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
    const [deductionValues, setDeductionValues] = useState<Record<number, string>>(() => {
        const m: Record<number, string> = {};
        initialRun.items.forEach(item => { m[item.id] = String(item.deductions); });
        return m;
    });
    const [approving, setApproving] = useState(false);
    const [markingPaid, setMarkingPaid] = useState(false);

    function toggleItem(id: number) {
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    function updateDeduction(itemId: number, value: number) {
        const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
        fetch(`/payroll-items/${itemId}/deduction`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token,
                'Accept': 'application/json',
            },
            body: JSON.stringify({ deductions: value }),
        })
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                setRun(prev => ({
                    ...prev,
                    total_amount: data.run_total,
                    items: prev.items.map(item =>
                        item.id === itemId
                            ? { ...item, deductions: value, net_pay: data.net_pay }
                            : item
                    ),
                }));
            }
        });
    }

    function handleApprove() {
        if (approving) return;
        setApproving(true);
        router.patch(`/payroll/${run.id}/approve`, {}, {
            onSuccess: () => {
                const today = new Date().toISOString().split('T')[0];
                setRun(prev => ({ ...prev, status: 'approved', approved_at: today }));
            },
            onFinish: () => setApproving(false),
        });
    }

    function handleMarkPaid() {
        if (markingPaid) return;
        if (!window.confirm('¿Marcar este ciclo de nómina como pagado? Esta acción no se puede deshacer.')) return;
        setMarkingPaid(true);
        router.patch(`/payroll/${run.id}/mark-paid`, {}, {
            onSuccess: () => {
                const today = new Date().toISOString().split('T')[0];
                setRun(prev => ({ ...prev, status: 'paid', paid_at: today }));
            },
            onFinish: () => setMarkingPaid(false),
        });
    }

    const cardStyle: React.CSSProperties = {
        background: '#FFFFFF',
        border: '1px solid #E0EBED',
        borderRadius: '14px',
        overflow: 'hidden',
        marginBottom: '20px',
    };

    return (
        <>
            <Head title={`Ciclo de nómina #${run.id}`} />

            {/* Back link */}
            <div style={{ marginBottom: '16px' }}>
                <a href="/payroll" style={{ fontSize: '13px', color: '#5E7A80', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    ← Volver a Nómina
                </a>
            </div>

            {/* Header card */}
            <div style={{ ...cardStyle }}>
                <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <h1 style={{ fontFamily: "'Bitter', Georgia, serif", fontSize: '20px', fontWeight: 700, color: '#123238', margin: 0 }}>
                                Ciclo de nómina
                            </h1>
                            <StatusChip status={run.status} />
                        </div>
                        <div style={{ fontSize: '14px', color: '#5E7A80', marginBottom: '4px' }}>
                            Período: <strong style={{ color: '#123238' }}>{formatPeriod(run.period_start, run.period_end)}</strong>
                        </div>
                        {run.approved_at && (
                            <div style={{ fontSize: '12px', color: '#5E7A80' }}>
                                Aprobado: {formatDate(run.approved_at)}
                            </div>
                        )}
                        {run.paid_at && (
                            <div style={{ fontSize: '12px', color: '#1F5C3D', marginTop: '2px', fontWeight: 500 }}>
                                Pagado el {formatDate(run.paid_at)}
                            </div>
                        )}
                        {run.notes && (
                            <div style={{ fontSize: '12px', color: '#5E7A80', marginTop: '8px', fontStyle: 'italic' }}>
                                {run.notes}
                            </div>
                        )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#5E7A80', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Pago total</div>
                        <div style={{ fontFamily: "'Bitter', Georgia, serif", fontSize: '32px', fontWeight: 700, color: '#1a4e57' }}>
                            RD${run.total_amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </div>
                        <div style={{ fontSize: '12px', color: '#5E7A80', marginTop: '2px' }}>
                            {run.items.length} {run.items.length === 1 ? 'chofer' : 'choferes'}
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div style={{ padding: '14px 28px', borderTop: '1px solid #E0EBED', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => window.open(`/payroll/${run.id}/pdf`, '_blank')}
                        style={outlineBtnStyle}
                    >
                        Descargar PDF
                    </button>
                    {run.status === 'draft' && (
                        <button
                            onClick={handleApprove}
                            disabled={approving}
                            style={{
                                padding: '8px 18px',
                                background: approving ? '#B0C8CC' : '#1a4e57',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 500,
                                cursor: approving ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {approving ? 'Aprobando…' : 'Aprobar ciclo'}
                        </button>
                    )}
                    {run.status === 'approved' && (
                        <button
                            onClick={handleMarkPaid}
                            disabled={markingPaid}
                            style={{
                                padding: '8px 18px',
                                background: markingPaid ? '#B0C8CC' : '#2E8055',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 500,
                                cursor: markingPaid ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {markingPaid ? 'Marcando…' : 'Marcar todo como pagado'}
                        </button>
                    )}
                </div>
            </div>

            {/* Drivers table card */}
            <div style={cardStyle}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #E0EBED' }}>
                    <span style={{ fontFamily: "'Bitter', Georgia, serif", fontSize: '16px', fontWeight: 600, color: '#123238' }}>
                        Desglose por chofer
                    </span>
                </div>

                {/* Table header */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#F5F9FA' }}>
                                <th style={thStyle}>Chofer</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Viajes</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Pago bruto</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Deducciones</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Pago neto</th>
                                <th style={thStyle}>Estado</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {run.items.map(item => {
                                const expanded = expandedItems.has(item.id);
                                const canEdit = run.status === 'draft';
                                const dedVal = deductionValues[item.id] ?? String(item.deductions);

                                return (
                                    <>
                                        <tr
                                            key={item.id}
                                            style={{ cursor: 'pointer' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#F9FBFC')}
                                            onMouseLeave={e => (e.currentTarget.style.background = '')}
                                        >
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: 600, color: '#123238', fontSize: '13px' }}>
                                                    {item.driver_name}
                                                </div>
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'center', color: '#5E7A80' }}>
                                                {item.trips_count}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'right', color: '#5E7A80' }}>
                                                RD${item.gross_pay.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                {canEdit ? (
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step={100}
                                                        value={dedVal}
                                                        onChange={e => setDeductionValues(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                        onBlur={e => {
                                                            const v = parseFloat(e.target.value) || 0;
                                                            updateDeduction(item.id, v);
                                                        }}
                                                        onClick={e => e.stopPropagation()}
                                                        style={{
                                                            width: '100px',
                                                            padding: '5px 8px',
                                                            border: '1px solid #DCE8EA',
                                                            borderRadius: '6px',
                                                            fontSize: '12px',
                                                            textAlign: 'right',
                                                            color: '#123238',
                                                            background: '#FFFFFF',
                                                            outline: 'none',
                                                        }}
                                                    />
                                                ) : (
                                                    <span style={{ color: item.deductions > 0 ? '#B14C3C' : '#5E7A80' }}>
                                                        RD${item.deductions.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                <span style={{ fontFamily: "'Bitter', Georgia, serif", fontWeight: 700, fontSize: '14px', color: '#1a4e57' }}>
                                                    RD${item.net_pay.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    background: item.status === 'paid' ? '#E6F4EC' : '#F0EFEF',
                                                    color: item.status === 'paid' ? '#1F5C3D' : '#595959',
                                                    borderRadius: '20px',
                                                    padding: '3px 9px',
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                }}>
                                                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: item.status === 'paid' ? '#2E8055' : '#9B9B9B' }} />
                                                    {item.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                <button
                                                    onClick={() => toggleItem(item.id)}
                                                    style={{
                                                        padding: '4px 10px',
                                                        background: 'transparent',
                                                        border: '1px solid #DCE8EA',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        color: '#5E7A80',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {expanded ? 'Ocultar' : 'Viajes'}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded trips */}
                                        {expanded && (
                                            <tr key={`trips-${item.id}`}>
                                                <td colSpan={7} style={{ padding: 0, background: '#F9FBFC', borderBottom: '2px solid #E0EBED' }}>
                                                    <div style={{ overflowX: 'auto' }}>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                            <thead>
                                                                <tr>
                                                                    <th style={subThStyle}>Fecha</th>
                                                                    <th style={subThStyle}>Cliente</th>
                                                                    <th style={subThStyle}>Ruta</th>
                                                                    <th style={{ ...subThStyle, textAlign: 'right' }}>Tarifa</th>
                                                                    <th style={{ ...subThStyle, textAlign: 'right' }}>Pago al chofer</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {item.trips.map(t => (
                                                                    <tr key={t.id}>
                                                                        <td style={{ ...subTdStyle, color: '#5E7A80' }}>{formatDate(t.date)}</td>
                                                                        <td style={subTdStyle}>{t.client}</td>
                                                                        <td style={{ ...subTdStyle, color: '#5E7A80' }}>{t.from} → {t.to}</td>
                                                                        <td style={{ ...subTdStyle, textAlign: 'right', color: '#5E7A80' }}>
                                                                            RD${t.rate.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                                                        </td>
                                                                        <td style={{ ...subTdStyle, textAlign: 'right', fontWeight: 600, color: '#1a4e57' }}>
                                                                            RD${t.driver_pay.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Grand total footer */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '14px 24px',
                    borderTop: '2px solid #1a4e57',
                    background: '#F5F9FA',
                    gap: '12px',
                }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#5E7A80', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Pago total
                    </span>
                    <span style={{ fontFamily: "'Bitter', Georgia, serif", fontSize: '22px', fontWeight: 700, color: '#1a4e57' }}>
                        RD${run.total_amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </span>
                </div>
            </div>
        </>
    );
}

const outlineBtnStyle: React.CSSProperties = {
    padding: '8px 18px',
    background: '#FFFFFF',
    color: '#1a4e57',
    border: '1px solid #DCE8EA',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
};

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

const subThStyle: React.CSSProperties = {
    padding: '7px 20px',
    textAlign: 'left',
    fontSize: '10px',
    fontWeight: 600,
    color: '#5E7A80',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #E0EBED',
    background: '#F0F5F6',
};

const subTdStyle: React.CSSProperties = {
    padding: '9px 20px',
    borderBottom: '1px solid #EDF1F2',
    fontSize: '12px',
    color: '#2c2c2c',
};
