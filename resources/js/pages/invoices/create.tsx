import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { ArrowLeft, CheckSquare, Square } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderOption {
    id: number;
    order_number: string;
    client_id: number;
    client: string;
    date: string;
    from: string;
    to: string;
    rate: number;
    type: 'import' | 'export';
    line: string;
}

interface CreateInvoiceProps {
    readyOrders: OrderOption[];
    clients: { id: number; name: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<string, { bg: string; fg: string }> = {
    import: { bg: '#EAF2FA', fg: '#2C4E72' },
    export: { bg: '#E6F4EC', fg: '#1F5C3D' },
};

function formatCurrency(v: number) {
    return 'RD$' + v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(d: string) {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Input style ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #DCE8EA',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    color: '#123238',
    background: '#FAFCFC',
    outline: 'none',
};

const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
};

// ─── Section header ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#5E7A80',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: '8px',
            }}
        >
            {children}
        </div>
    );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div
            style={{
                background: '#FFFFFF',
                border: '1px solid #E0EBED',
                borderRadius: '14px',
                padding: '24px',
                ...style,
            }}
        >
            {children}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CreateInvoice({ readyOrders = [], clients = [] }: CreateInvoiceProps) {
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
    const [taxRate, setTaxRate] = useState<number>(18);
    const [paymentTerms, setPaymentTerms] = useState<string>('net30');
    const [notes, setNotes] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    const clientOrders = useMemo(
        () =>
            selectedClientId !== null
                ? readyOrders.filter((o) => o.client_id === selectedClientId)
                : [],
        [selectedClientId, readyOrders],
    );

    const selectedOrders = useMemo(
        () => readyOrders.filter((o) => selectedOrderIds.includes(o.id)),
        [selectedOrderIds, readyOrders],
    );

    const subtotal = useMemo(
        () => selectedOrders.reduce((sum, o) => sum + o.rate, 0),
        [selectedOrders],
    );

    const taxAmount = useMemo(
        () => Math.round(subtotal * (taxRate / 100) * 100) / 100,
        [subtotal, taxRate],
    );

    const total = subtotal + taxAmount;

    function handleClientChange(id: number | null) {
        setSelectedClientId(id);
        setSelectedOrderIds([]);
    }

    function toggleOrder(id: number) {
        setSelectedOrderIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    }

    function toggleAll() {
        if (selectedOrderIds.length === clientOrders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(clientOrders.map((o) => o.id));
        }
    }

    function handleSubmit() {
        if (!selectedClientId || selectedOrderIds.length === 0) return;
        setSubmitting(true);
        router.post('/invoices', {
            client_id: selectedClientId,
            order_ids: selectedOrderIds,
            tax_rate: taxRate,
            payment_terms: paymentTerms,
            notes: notes || null,
        });
    }

    const allSelected =
        clientOrders.length > 0 && selectedOrderIds.length === clientOrders.length;

    return (
        <>
            <Head title="New Invoice" />

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
                Back to Invoices
            </button>

            {/* Title */}
            <div
                style={{
                    fontFamily: "'Bitter', Georgia, serif",
                    fontWeight: 700,
                    fontSize: '22px',
                    color: '#123238',
                    marginBottom: '24px',
                }}
            >
                New Invoice
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Left column */}
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Section 1 — Select Client */}
                    <Card>
                        <SectionLabel>Step 1 — Select Client</SectionLabel>
                        <select
                            style={selectStyle}
                            value={selectedClientId ?? ''}
                            onChange={(e) =>
                                handleClientChange(e.target.value ? Number(e.target.value) : null)
                            }
                        >
                            <option value="">Select a client to see available orders…</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </Card>

                    {/* Section 2 — Select Orders */}
                    {selectedClientId !== null && (
                        <Card style={{ padding: 0 }}>
                            {/* Header */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px 24px',
                                    borderBottom: '1px solid #E0EBED',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span
                                        style={{
                                            fontFamily: "'Bitter', Georgia, serif",
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            color: '#123238',
                                        }}
                                    >
                                        Available Orders
                                    </span>
                                    <span
                                        style={{
                                            background: '#EFF5F6',
                                            color: '#5E7A80',
                                            borderRadius: '20px',
                                            padding: '2px 8px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {clientOrders.length}
                                    </span>
                                </div>
                                {clientOrders.length > 0 && (
                                    <button
                                        onClick={toggleAll}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            color: '#1a4e57',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {allSelected ? (
                                            <CheckSquare size={14} />
                                        ) : (
                                            <Square size={14} />
                                        )}
                                        {allSelected ? 'Deselect all' : 'Select all'}
                                    </button>
                                )}
                            </div>

                            {clientOrders.length === 0 ? (
                                <div
                                    style={{
                                        padding: '32px 24px',
                                        textAlign: 'center',
                                        color: '#9DB3B8',
                                        fontSize: '13px',
                                    }}
                                >
                                    No ready orders for this client.
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table
                                        style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}
                                    >
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #E0EBED' }}>
                                                <th style={{ width: '40px', padding: '8px 12px 8px 20px' }} />
                                                {['Order #', 'Date', 'Service', 'Route', 'Carrier', 'Amount'].map(
                                                    (h) => (
                                                        <th
                                                            key={h}
                                                            style={{
                                                                padding: '8px 12px',
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
                                            {clientOrders.map((o, idx) => {
                                                const checked = selectedOrderIds.includes(o.id);
                                                const tc = TYPE_STYLES[o.type] ?? TYPE_STYLES.import;
                                                return (
                                                    <tr
                                                        key={o.id}
                                                        onClick={() => toggleOrder(o.id)}
                                                        style={{
                                                            borderBottom:
                                                                idx < clientOrders.length - 1
                                                                    ? '1px solid #EFF5F6'
                                                                    : 'none',
                                                            cursor: 'pointer',
                                                            background: checked
                                                                ? '#F2F7F8'
                                                                : 'transparent',
                                                            transition: 'background 0.1s',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!checked)
                                                                e.currentTarget.style.background = '#F8FBFB';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = checked
                                                                ? '#F2F7F8'
                                                                : 'transparent';
                                                        }}
                                                    >
                                                        <td style={{ padding: '10px 12px 10px 20px' }}>
                                                            {checked ? (
                                                                <CheckSquare
                                                                    size={16}
                                                                    color="#1a4e57"
                                                                />
                                                            ) : (
                                                                <Square size={16} color="#9DB3B8" />
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 600, color: '#1a4e57', whiteSpace: 'nowrap' }}>
                                                            {o.order_number}
                                                        </td>
                                                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#5E7A80', whiteSpace: 'nowrap' }}>
                                                            {formatDate(o.date)}
                                                        </td>
                                                        <td style={{ padding: '10px 12px' }}>
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
                                                                {o.type}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#123238', whiteSpace: 'nowrap' }}>
                                                            {o.from} → {o.to}
                                                        </td>
                                                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#5E7A80', whiteSpace: 'nowrap' }}>
                                                            {o.line || '—'}
                                                        </td>
                                                        <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 600, color: '#123238', whiteSpace: 'nowrap' }}>
                                                            {formatCurrency(o.rate)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Running subtotal */}
                            {selectedOrderIds.length > 0 && (
                                <div
                                    style={{
                                        padding: '12px 24px',
                                        borderTop: '1px solid #E0EBED',
                                        fontSize: '13px',
                                        color: '#5E7A80',
                                        background: '#FAFCFC',
                                    }}
                                >
                                    <span style={{ fontWeight: 600, color: '#123238' }}>
                                        {selectedOrderIds.length}
                                    </span>{' '}
                                    order{selectedOrderIds.length !== 1 ? 's' : ''} selected —
                                    Subtotal:{' '}
                                    <span style={{ fontWeight: 700, color: '#1a4e57' }}>
                                        {formatCurrency(subtotal)}
                                    </span>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Section 3 — Invoice Settings */}
                    {selectedOrderIds.length > 0 && (
                        <Card>
                            <SectionLabel>Step 3 — Invoice Settings</SectionLabel>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '140px' }}>
                                    <label
                                        style={{
                                            display: 'block',
                                            fontSize: '12px',
                                            color: '#5E7A80',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        Tax Rate (%)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        step={0.5}
                                        value={taxRate}
                                        onChange={(e) =>
                                            setTaxRate(Math.max(0, Math.min(100, Number(e.target.value))))
                                        }
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: '140px' }}>
                                    <label
                                        style={{
                                            display: 'block',
                                            fontSize: '12px',
                                            color: '#5E7A80',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        Payment Terms
                                    </label>
                                    <select
                                        value={paymentTerms}
                                        onChange={(e) => setPaymentTerms(e.target.value)}
                                        style={selectStyle}
                                    >
                                        <option value="net15">Net 15</option>
                                        <option value="net30">Net 30</option>
                                        <option value="net60">Net 60</option>
                                        <option value="net90">Net 90</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginTop: '16px' }}>
                                <label
                                    style={{
                                        display: 'block',
                                        fontSize: '12px',
                                        color: '#5E7A80',
                                        marginBottom: '6px',
                                    }}
                                >
                                    Notes (optional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Payment instructions, references, etc."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    style={{
                                        ...inputStyle,
                                        resize: 'vertical',
                                    }}
                                />
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right column — Summary panel */}
                {selectedOrderIds.length > 0 && (
                    <div style={{ width: '280px', flexShrink: 0 }}>
                        <Card
                            style={{
                                position: 'sticky',
                                top: '24px',
                                boxShadow: '0 4px 20px rgba(18,50,56,0.09)',
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "'Bitter', Georgia, serif",
                                    fontWeight: 700,
                                    fontSize: '15px',
                                    color: '#123238',
                                    marginBottom: '20px',
                                }}
                            >
                                Summary
                            </div>

                            {/* Line items */}
                            {[
                                { label: 'Subtotal', value: formatCurrency(subtotal) },
                                { label: `ITBIS (${taxRate}%)`, value: formatCurrency(taxAmount) },
                            ].map(({ label, value }) => (
                                <div
                                    key={label}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
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

                            {/* Total */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '16px 0 8px',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '13px',
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
                                        fontSize: '22px',
                                        fontWeight: 700,
                                        color: '#1a4e57',
                                    }}
                                >
                                    {formatCurrency(total)}
                                </span>
                            </div>

                            {/* Buttons */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    marginTop: '16px',
                                }}
                            >
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || selectedOrderIds.length === 0}
                                    style={{
                                        width: '100%',
                                        background:
                                            submitting || selectedOrderIds.length === 0
                                                ? '#A0BAC0'
                                                : '#1a4e57',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '10px 16px',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        cursor:
                                            submitting || selectedOrderIds.length === 0
                                                ? 'not-allowed'
                                                : 'pointer',
                                    }}
                                >
                                    {submitting ? 'Generating…' : 'Generate Invoice →'}
                                </button>
                                <button
                                    onClick={() => router.get('/invoices')}
                                    style={{
                                        width: '100%',
                                        background: 'transparent',
                                        color: '#5E7A80',
                                        border: '1px solid #DCE8EA',
                                        borderRadius: '8px',
                                        padding: '9px 16px',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}
