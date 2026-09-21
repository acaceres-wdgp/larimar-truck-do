import { Head, Link, router } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';
import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvoiceRow {
    id: number;
    invoice_number: string;
    client: string;
    client_id: number | null;
    issued_at: string;
    due_date: string;
    paid_at: string | null;
    payment_terms: string;
    subtotal: number;
    tax_amount: number;
    total: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    orders_count: number;
}

interface InvoicesProps {
    overdueCount: number;
    readyOrders: number;
    invoicesThisMonth: number;
    invoices: InvoiceRow[];
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
                padding: '3px 10px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
            }}
        >
            <span
                style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: c.dot,
                    flexShrink: 0,
                }}
            />
            {status}
        </span>
    );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
    label,
    value,
    sub,
    accent,
}: {
    label: string;
    value: string | number;
    sub?: string;
    accent?: string;
}) {
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#5E7A80',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '10px',
                }}
            >
                {accent && (
                    <span
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: accent,
                            flexShrink: 0,
                        }}
                    />
                )}
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
                <div style={{ fontSize: '12px', color: '#9DB3B8', marginTop: '6px' }}>
                    {sub}
                </div>
            )}
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
    return 'RD$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatTerms(terms: string): string {
    const map: Record<string, string> = {
        net15: 'Net 15',
        net30: 'Net 30',
        net60: 'Net 60',
        net90: 'Net 90',
    };
    return map[terms] ?? terms.toUpperCase();
}

function formatDate(d: string | null): string {
    if (!d) return '—';
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Main page ────────────────────────────────────────────────────────────────

const STATUS_TABS = ['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'] as const;

export default function Invoices({
    overdueCount = 0,
    readyOrders = 0,
    invoicesThisMonth = 0,
    invoices = [],
}: InvoicesProps) {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>('all');

    const filtered = invoices.filter((inv) => {
        const matchTab = activeTab === 'all' || inv.status === activeTab;
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            inv.invoice_number.toLowerCase().includes(q) ||
            inv.client.toLowerCase().includes(q);
        return matchTab && matchSearch;
    });

    return (
        <>
            <Head title="Invoices" />

            {/* KPI Cards */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <KpiCard
                    label="Overdue Invoices"
                    value={overdueCount}
                    sub="Require attention"
                    accent="#C4483A"
                />
                <KpiCard
                    label="Ready to Invoice"
                    value={readyOrders}
                    sub="Orders awaiting billing"
                    accent="#2E8055"
                />
                <KpiCard
                    label="Invoices This Month"
                    value={invoicesThisMonth}
                    sub="Current month"
                    accent="#1a4e57"
                />
            </div>

            {/* Main card */}
            <div
                style={{
                    background: '#FFFFFF',
                    border: '1px solid #E0EBED',
                    borderRadius: '14px',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 24px 16px',
                        gap: '12px',
                        flexWrap: 'wrap',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                                style={{
                                    fontFamily: "'Bitter', Georgia, serif",
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    color: '#123238',
                                }}
                            >
                                Invoices
                            </span>
                            <span
                                style={{
                                    background: '#EFF5F6',
                                    color: '#5E7A80',
                                    borderRadius: '20px',
                                    padding: '2px 8px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                }}
                            >
                                {invoices.length}
                            </span>
                        </div>
                        <input
                            type="text"
                            placeholder="Search invoice or client…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                flex: 1,
                                maxWidth: '280px',
                                border: '1px solid #DCE8EA',
                                borderRadius: '8px',
                                padding: '7px 12px',
                                fontSize: '13px',
                                color: '#123238',
                                outline: 'none',
                                background: '#FAFCFC',
                            }}
                        />
                    </div>
                    <Link
                        href="/invoices/create"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#1a4e57',
                            color: '#FFFFFF',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <Plus size={15} />
                        New Invoice
                    </Link>
                </div>

                {/* Status tabs */}
                <div
                    style={{
                        display: 'flex',
                        gap: '2px',
                        padding: '0 24px',
                        borderBottom: '1px solid #E0EBED',
                    }}
                >
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px 12px',
                                fontSize: '13px',
                                fontWeight: activeTab === tab ? 600 : 400,
                                color: activeTab === tab ? '#1a4e57' : '#5E7A80',
                                borderBottom: activeTab === tab ? '2px solid #1a4e57' : '2px solid transparent',
                                marginBottom: '-1px',
                                textTransform: 'capitalize',
                                transition: 'color 0.15s',
                            }}
                        >
                            {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            minWidth: '700px',
                        }}
                    >
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E0EBED' }}>
                                {[
                                    { label: 'Invoice #', w: '110px' },
                                    { label: 'Client', w: 'auto' },
                                    { label: 'Issued', w: '100px' },
                                    { label: 'Due', w: '100px' },
                                    { label: 'Orders', w: '70px' },
                                    { label: 'Total', w: '130px' },
                                    { label: 'Status', w: '110px' },
                                    { label: '', w: '60px' },
                                ].map(({ label, w }) => (
                                    <th
                                        key={label}
                                        style={{
                                            width: w,
                                            padding: '10px 16px',
                                            textAlign: 'left',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            color: '#5E7A80',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        style={{
                                            padding: '48px 24px',
                                            textAlign: 'center',
                                            color: '#9DB3B8',
                                            fontSize: '13px',
                                        }}
                                    >
                                        No invoices found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((inv, idx) => (
                                    <tr
                                        key={inv.id}
                                        onClick={() => router.get(`/invoices/${inv.id}`)}
                                        style={{
                                            borderBottom:
                                                idx < filtered.length - 1
                                                    ? '1px solid #EFF5F6'
                                                    : 'none',
                                            cursor: 'pointer',
                                            transition: 'background 0.1s',
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.background = '#F8FBFB')
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.background = 'transparent')
                                        }
                                    >
                                        <td style={{ padding: '12px 16px' }}>
                                            <span
                                                style={{
                                                    fontFamily: "'Bitter', Georgia, serif",
                                                    fontWeight: 600,
                                                    fontSize: '13px',
                                                    color: '#1a4e57',
                                                }}
                                            >
                                                {inv.invoice_number}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div
                                                style={{
                                                    fontSize: '13px',
                                                    color: '#123238',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {inv.client}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#9DB3B8', marginTop: '1px' }}>
                                                {formatTerms(inv.payment_terms)}
                                            </div>
                                        </td>
                                        <td
                                            style={{
                                                padding: '12px 16px',
                                                fontSize: '12px',
                                                color: '#5E7A80',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {formatDate(inv.issued_at)}
                                        </td>
                                        <td
                                            style={{
                                                padding: '12px 16px',
                                                fontSize: '12px',
                                                color:
                                                    inv.status === 'overdue'
                                                        ? '#C4483A'
                                                        : '#5E7A80',
                                                whiteSpace: 'nowrap',
                                                fontWeight: inv.status === 'overdue' ? 600 : 400,
                                            }}
                                        >
                                            {formatDate(inv.due_date)}
                                        </td>
                                        <td
                                            style={{
                                                padding: '12px 16px',
                                                fontSize: '12px',
                                                color: '#5E7A80',
                                                textAlign: 'center',
                                            }}
                                        >
                                            {inv.orders_count}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span
                                                style={{
                                                    fontFamily: "'Bitter', Georgia, serif",
                                                    fontSize: '14px',
                                                    fontWeight: 700,
                                                    color: '#123238',
                                                }}
                                            >
                                                {formatCurrency(inv.total)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <StatusChip status={inv.status} />
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.get(`/invoices/${inv.id}`);
                                                }}
                                                title="View"
                                                style={{
                                                    background: 'none',
                                                    border: '1px solid #DCE8EA',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    padding: '5px 8px',
                                                    color: '#5E7A80',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Eye size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: '12px 24px',
                        borderTop: '1px solid #E0EBED',
                        fontSize: '12px',
                        color: '#9DB3B8',
                    }}
                >
                    {filtered.length} invoice{filtered.length !== 1 ? 's' : ''} shown
                </div>
            </div>
        </>
    );
}
