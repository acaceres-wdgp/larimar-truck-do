import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Download, CheckCheck, CreditCard } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderLine {
    id: number;
    order_number: string;
    date: string;
    type: string;
    from: string;
    to: string;
    truck: string | null;
    driver: string | null;
    line: string | null;
    rate: number;
}

interface InvoiceDetail {
    id: number;
    invoice_number: string;
    client: string;
    client_id: number | null;
    issued_at: string;
    due_date: string;
    paid_at: string | null;
    payment_terms: string;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    status: string;
    notes: string | null;
    orders: OrderLine[];
}

interface ShowInvoiceProps {
    invoice: InvoiceDetail;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; fg: string; dot: string }> = {
    draft:     { bg: '#F0EFEF', fg: '#595959', dot: '#9B9B9B' },
    sent:      { bg: '#EAF2FA', fg: '#2C4E72', dot: '#5B84B1' },
    paid:      { bg: '#E6F4EC', fg: '#1F5C3D', dot: '#2E8055' },
    overdue:   { bg: '#FBEAE7', fg: '#8A2A21', dot: '#C4483A' },
    cancelled: { bg: '#F0EFEF', fg: '#595959', dot: '#9B9B9B' },
};

function StatusChip({ status }: { status: string }) {
    const c = STATUS_COLORS[status] ?? STATUS_COLORS.draft;
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: c.bg,
                color: c.fg,
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'capitalize',
            }}
        >
            <span
                style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: c.dot,
                }}
            />
            {{ draft: 'Borrador', sent: 'Enviada', paid: 'Pagada', overdue: 'Vencida', cancelled: 'Cancelada' }[status] ?? status}
        </span>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<string, { bg: string; fg: string }> = {
    import: { bg: '#EAF2FA', fg: '#2C4E72' },
    export: { bg: '#E6F4EC', fg: '#1F5C3D' },
};

function formatCurrency(v: number) {
    return 'RD$' + v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(d: string | null) {
    if (!d) return '—';
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('es-DO', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTerms(t: string) {
    const map: Record<string, string> = { net15: 'Net 15', net30: 'Net 30', net60: 'Net 60', net90: 'Net 90' };
    return map[t] ?? t.toUpperCase();
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div
            style={{
                background: '#FFFFFF',
                border: '1px solid #E0EBED',
                borderRadius: '14px',
                overflow: 'hidden',
                ...style,
            }}
        >
            {children}
        </div>
    );
}

function CardHeader({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                padding: '16px 24px',
                borderBottom: '1px solid #E0EBED',
                fontFamily: "'Bitter', Georgia, serif",
                fontWeight: 600,
                fontSize: '14px',
                color: '#123238',
            }}
        >
            {children}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ShowInvoice({ invoice }: ShowInvoiceProps) {
    function handleMarkSent() {
        router.patch(`/invoices/${invoice.id}/mark-sent`);
    }

    function handleMarkPaid() {
        if (
            window.confirm(
                `¿Marcar la factura ${invoice.invoice_number} como pagada?\n\nEsta acción no se puede deshacer.`,
            )
        ) {
            router.patch(`/invoices/${invoice.id}/mark-paid`);
        }
    }

    const canMarkSent = invoice.status === 'draft';
    const canMarkPaid = ['draft', 'sent', 'overdue'].includes(invoice.status);

    return (
        <>
            <Head title={invoice.invoice_number} />

            {/* Back link */}
            <button
                onClick={() => router.get('/invoices')}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#5E7A80',
                    fontSize: '13px',
                    marginBottom: '20px',
                    padding: 0,
                }}
            >
                <ArrowLeft size={15} />
                Volver a Facturas
            </button>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Main content */}
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Header card */}
                    <Card>
                        <div style={{ padding: '24px' }}>
                            {/* Top row: invoice number + status */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                    marginBottom: '16px',
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Bitter', Georgia, serif",
                                        fontWeight: 700,
                                        fontSize: '28px',
                                        color: '#1a4e57',
                                        letterSpacing: '-0.5px',
                                    }}
                                >
                                    {invoice.invoice_number}
                                </div>
                                <StatusChip status={invoice.status} />
                            </div>

                            {/* Client + terms */}
                            <div style={{ marginBottom: '20px' }}>
                                <div
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        color: '#123238',
                                        marginBottom: '4px',
                                    }}
                                >
                                    {invoice.client}
                                </div>
                                <span
                                    style={{
                                        display: 'inline-block',
                                        background: '#EFF5F6',
                                        color: '#5E7A80',
                                        borderRadius: '6px',
                                        padding: '2px 8px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                    }}
                                >
                                    {formatTerms(invoice.payment_terms)}
                                </span>
                            </div>

                            {/* Dates row */}
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '24px',
                                    flexWrap: 'wrap',
                                    borderTop: '1px solid #EFF5F6',
                                    paddingTop: '16px',
                                }}
                            >
                                {[
                                    { label: 'Emitida', value: formatDate(invoice.issued_at) },
                                    { label: 'Vence', value: formatDate(invoice.due_date) },
                                    ...(invoice.paid_at
                                        ? [{ label: 'Pagada', value: formatDate(invoice.paid_at) }]
                                        : []),
                                ].map(({ label, value }) => (
                                    <div key={label}>
                                        <div
                                            style={{
                                                fontSize: '10px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.06em',
                                                color: '#9DB3B8',
                                                fontWeight: 600,
                                                marginBottom: '3px',
                                            }}
                                        >
                                            {label}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: '#123238',
                                            }}
                                        >
                                            {value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Orders table card */}
                    <Card>
                        <CardHeader>Órdenes ({invoice.orders.length})</CardHeader>
                        <div style={{ overflowX: 'auto' }}>
                            <table
                                style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    minWidth: '560px',
                                }}
                            >
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #E0EBED' }}>
                                        {['Orden #', 'Fecha', 'Servicio', 'Ruta', 'Naviera', 'Monto'].map(
                                            (h) => (
                                                <th
                                                    key={h}
                                                    style={{
                                                        padding: '10px 16px',
                                                        textAlign: 'left',
                                                        fontSize: '10px',
                                                        fontWeight: 600,
                                                        color: '#5E7A80',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {h}
                                                </th>
                                            ),
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.orders.map((o, idx) => {
                                        const tc = TYPE_STYLES[o.type] ?? TYPE_STYLES.import;
                                        return (
                                            <tr
                                                key={o.id}
                                                style={{
                                                    borderBottom:
                                                        idx < invoice.orders.length - 1
                                                            ? '1px solid #EFF5F6'
                                                            : 'none',
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding: '12px 16px',
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        color: '#1a4e57',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {o.order_number}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '12px 16px',
                                                        fontSize: '12px',
                                                        color: '#5E7A80',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {formatDate(o.date)}
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    {o.type && (
                                                        <span
                                                            style={{
                                                                display: 'inline-block',
                                                                background: tc.bg,
                                                                color: tc.fg,
                                                                borderRadius: '20px',
                                                                padding: '2px 8px',
                                                                fontSize: '10px',
                                                                fontWeight: 600,
                                                                textTransform: 'capitalize',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {{ import: 'Importación', export: 'Exportación' }[o.type] ?? o.type}
                                                        </span>
                                                    )}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '12px 16px',
                                                        fontSize: '12px',
                                                        color: '#123238',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {o.from} → {o.to}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '12px 16px',
                                                        fontSize: '12px',
                                                        color: '#5E7A80',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {o.line || '—'}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '12px 16px',
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        color: '#123238',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {formatCurrency(o.rate)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Financials card */}
                    <Card>
                        <CardHeader>Finanzas</CardHeader>
                        <div style={{ padding: '16px 24px' }}>
                            <div style={{ maxWidth: '320px', marginLeft: 'auto' }}>
                                {[
                                    { label: 'Subtotal', value: formatCurrency(invoice.subtotal) },
                                    {
                                        label: `ITBIS (${invoice.tax_rate}%)`,
                                        value: formatCurrency(invoice.tax_amount),
                                    },
                                ].map(({ label, value }) => (
                                    <div
                                        key={label}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '8px 0',
                                            borderBottom: '1px solid #EFF5F6',
                                            fontSize: '13px',
                                            color: '#5E7A80',
                                        }}
                                    >
                                        <span>{label}</span>
                                        <span style={{ color: '#123238', fontWeight: 500 }}>{value}</span>
                                    </div>
                                ))}
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingTop: '14px',
                                        marginTop: '4px',
                                        borderTop: '2px solid #1a4e57',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: '14px',
                                            fontWeight: 700,
                                            color: '#1a4e57',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.04em',
                                        }}
                                    >
                                        Total
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "'Bitter', Georgia, serif",
                                            fontSize: '24px',
                                            fontWeight: 700,
                                            color: '#1a4e57',
                                        }}
                                    >
                                        {formatCurrency(invoice.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Notes */}
                    {invoice.notes && (
                        <Card>
                            <CardHeader>Notas</CardHeader>
                            <div
                                style={{
                                    padding: '16px 24px',
                                    fontSize: '13px',
                                    color: '#3d5f66',
                                    lineHeight: 1.6,
                                }}
                            >
                                {invoice.notes}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right column — Actions */}
                <div style={{ width: '240px', flexShrink: 0 }}>
                    <Card style={{ position: 'sticky', top: '24px', overflow: 'visible' }}>
                        <div style={{ padding: '20px' }}>
                            <div
                                style={{
                                    fontFamily: "'Bitter', Georgia, serif",
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    color: '#123238',
                                    marginBottom: '16px',
                                }}
                            >
                                Acciones
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {/* Download PDF */}
                                <button
                                    onClick={() =>
                                        window.open(`/invoices/${invoice.id}/pdf`, '_blank')
                                    }
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '7px',
                                        width: '100%',
                                        background: '#1a4e57',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '10px 16px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Download size={14} />
                                    Descargar PDF
                                </button>

                                {/* Mark as Sent */}
                                {canMarkSent && (
                                    <button
                                        onClick={handleMarkSent}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '7px',
                                            width: '100%',
                                            background: '#EAF2FA',
                                            color: '#2C4E72',
                                            border: '1px solid #C0D7EC',
                                            borderRadius: '8px',
                                            padding: '9px 16px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <CheckCheck size={14} />
                                        Marcar como enviada
                                    </button>
                                )}

                                {/* Mark as Paid */}
                                {canMarkPaid && (
                                    <button
                                        onClick={handleMarkPaid}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '7px',
                                            width: '100%',
                                            background: '#E6F4EC',
                                            color: '#1F5C3D',
                                            border: '1px solid #B2D9C0',
                                            borderRadius: '8px',
                                            padding: '9px 16px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <CreditCard size={14} />
                                        Marcar como pagada
                                    </button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}
