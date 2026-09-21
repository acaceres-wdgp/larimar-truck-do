import { Head, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ClientRow {
    id: number;
    name: string;
    kind: string;
    tax_id: string;
    contact_name: string | null;
    contact_role: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    payment_terms: string;
    credit_limit: number;
    status: 'Active' | 'Inactive';
    logo_path: string | null;
    client_since: string | null;
    initials: string;
    balance: number;
    overdue: number;
    open_invoices: number;
}

interface PageProps {
    clients: ClientRow[];
}

const STATUS_CFG = {
    Active: {
        label: 'Activo',
        bg: '#E6F4EC',
        fg: '#1F5C3D',
        dot: '#2E8055',
        ring: '#B8E0C4',
    },
    Inactive: {
        label: 'Inactivo',
        bg: '#F2F4F5',
        fg: '#4A5568',
        dot: '#718096',
        ring: '#CBD5E0',
    },
};

const STATUS_TABS: { key: string; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'Active', label: 'Activo' },
    { key: 'Inactive', label: 'Inactivo' },
];

function formatMoney(n: number): string {
    return 'RD$ ' + n.toLocaleString('en-US');
}

export default function ClientsIndex({ clients }: PageProps) {
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerW, setContainerW] = useState(1200);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) setContainerW(entry.contentRect.width);
        });
        ro.observe(el);
        setContainerW(el.getBoundingClientRect().width);
        return () => ro.disconnect();
    }, []);

    const filtered = clients.filter((c) => {
        const matchStatus = statusFilter === 'all' || c.status === statusFilter;
        if (!matchStatus) return false;
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
            c.name.toLowerCase().includes(q) ||
            c.tax_id.toLowerCase().includes(q) ||
            (c.contact_name?.toLowerCase() ?? '').includes(q) ||
            (c.contact_email?.toLowerCase() ?? '').includes(q)
        );
    });

    const totalCount = clients.length;
    const activeCount = clients.filter((c) => c.status === 'Active').length;
    const totalBalance = clients.reduce((sum, c) => sum + (c.balance ?? 0), 0);
    const overLimitCount = clients.filter(
        (c) => (c.balance ?? 0) > c.credit_limit,
    ).length;

    const tier =
        containerW >= 1260 ? 'full' : containerW >= 1000 ? 'mid' : 'compact';

    const gridCols =
        tier === 'full'
            ? '44px minmax(0,1.35fr) 170px 116px 140px 124px 104px'
            : tier === 'mid'
              ? '44px minmax(0,1.35fr) 170px 140px 124px 104px'
              : 'minmax(0,1fr) 120px 100px';

    const showLogo = tier !== 'compact';
    const showContact = tier !== 'compact';
    const showTerms = tier === 'full';
    const showBalance = tier !== 'compact';

    function handleDelete(client: ClientRow) {
        router.delete(`/clients/${client.id}`);
    }

    const thStyle: React.CSSProperties = {
        fontSize: '10.5px',
        fontWeight: 500,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: '#5E7A80',
    };

    return (
        <>
            <Head title="Clientes" />

            {/* Page header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: '18px',
                    flexWrap: 'wrap',
                    marginBottom: '20px',
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: '11.5px',
                            color: '#5E7A80',
                            marginBottom: '4px',
                        }}
                    >
                        Inicio / Clientes
                    </div>
                    <h2
                        style={{
                            fontFamily: "'Bitter', Georgia, serif",
                            fontWeight: 600,
                            fontSize: '25px',
                            letterSpacing: '-0.02em',
                            margin: 0,
                            color: '#123238',
                        }}
                    >
                        Cuentas
                    </h2>
                </div>
                <div style={{ display: 'flex', gap: '9px' }}>
                    <button
                        style={{
                            border: '1px solid #DCE8EA',
                            background: '#FFFFFF',
                            color: '#1a4e57',
                            fontSize: '13.5px',
                            fontWeight: 500,
                            padding: '9px 15px',
                            borderRadius: '9px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Exportar
                    </button>
                    <button
                        onClick={() => router.get('/clients/create')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            border: 'none',
                            background: '#1a4e57',
                            color: '#FFFFFF',
                            fontSize: '13.5px',
                            fontWeight: 500,
                            padding: '9px 16px',
                            borderRadius: '9px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <Plus size={15} strokeWidth={2} color="#b9f7fc" />
                        Nuevo cliente
                    </button>
                </div>
            </div>

            {/* Accounts card */}
            <section
                style={{
                    background: '#FFFFFF',
                    border: '1px solid #E0EBED',
                    borderRadius: '14px',
                    overflow: 'hidden',
                }}
                ref={containerRef}
            >
                {/* Card header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        gap: '16px',
                        flexWrap: 'wrap',
                        padding: '18px 20px 16px',
                        borderBottom: '1px solid #EFF5F6',
                    }}
                >
                    <div>
                        <h3
                            style={{
                                fontFamily: "'Bitter', Georgia, serif",
                                fontWeight: 600,
                                fontSize: '17px',
                                letterSpacing: '-0.015em',
                                margin: '0 0 3px',
                                color: '#123238',
                            }}
                        >
                            Cuentas
                        </h3>
                        <div style={{ fontSize: '12.5px', color: '#5E7A80' }}>
                            {totalCount} clientes · {activeCount} activos ·{' '}
                            {formatMoney(totalBalance)} por cobrar
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '9px',
                            flexWrap: 'wrap',
                        }}
                    >
                        {/* Search */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#F2F7F8',
                                border: '1px solid #E0EBED',
                                borderRadius: '9px',
                                padding: '7px 11px',
                                width: '210px',
                            }}
                        >
                            <Search
                                size={14}
                                strokeWidth={1.5}
                                color="#7E9AA0"
                                style={{ flexShrink: 0 }}
                            />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Nombre, RNC, contacto…"
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '12.5px',
                                    width: '100%',
                                    color: '#123238',
                                    outline: 'none',
                                }}
                            />
                        </div>
                        {/* Status tabs */}
                        <div
                            style={{
                                display: 'flex',
                                background: '#F2F7F8',
                                border: '1px solid #E0EBED',
                                borderRadius: '9px',
                                padding: '3px',
                                gap: '2px',
                                flexWrap: 'wrap',
                            }}
                        >
                            {STATUS_TABS.map((tab) => {
                                const isActive = statusFilter === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setStatusFilter(tab.key)}
                                        style={{
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '12.5px',
                                            fontWeight: 500,
                                            padding: '6px 11px',
                                            borderRadius: '6px',
                                            background: isActive
                                                ? '#FFFFFF'
                                                : 'transparent',
                                            boxShadow: isActive
                                                ? '0 1px 3px rgba(18,50,56,0.09)'
                                                : 'none',
                                            color: isActive
                                                ? '#1a4e57'
                                                : '#5E7A80',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Table header */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: gridCols,
                        gap: '10px',
                        alignItems: 'center',
                        padding: '9px 20px',
                        background: '#F8FBFB',
                        borderBottom: '1px solid #EFF5F6',
                    }}
                >
                    {showLogo && <div style={thStyle}>Imagen</div>}
                    <div style={thStyle}>Cliente</div>
                    {showContact && <div style={thStyle}>Contacto principal</div>}
                    {showTerms && <div style={thStyle}>Condiciones</div>}
                    {showBalance && (
                        <div style={{ ...thStyle, textAlign: 'right' }}>
                            Balance
                        </div>
                    )}
                    <div style={thStyle}>Estado</div>
                    <div style={{ ...thStyle, textAlign: 'right' }}>
                        Acciones
                    </div>
                </div>

                {/* Rows */}
                {filtered.map((client) => (
                    <ClientRowItem
                        key={client.id}
                        client={client}
                        cfg={STATUS_CFG[client.status]}
                        gridCols={gridCols}
                        showLogo={showLogo}
                        showContact={showContact}
                        showTerms={showTerms}
                        showBalance={showBalance}
                        isCompact={tier === 'compact'}
                        onDelete={handleDelete}
                    />
                ))}

                {filtered.length === 0 && (
                    <div
                        style={{
                            padding: '40px 20px',
                            textAlign: 'center',
                            fontSize: '12.5px',
                            color: '#5E7A80',
                        }}
                    >
                        Ningún cliente coincide con este filtro.
                    </div>
                )}

                {/* Footer */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        flexWrap: 'wrap',
                        padding: '11px 20px',
                        borderTop: '1px solid #EFF5F6',
                        background: '#F8FBFB',
                    }}
                >
                    <span style={{ fontSize: '11.5px', color: '#5E7A80' }}>
                        Mostrando {filtered.length} de {totalCount} clientes
                    </span>
                    <span
                        style={{
                            marginLeft: 'auto',
                            fontSize: '11.5px',
                            color: '#5E7A80',
                        }}
                    >
                        {overLimitCount} sobre su límite de crédito
                    </span>
                </div>
            </section>
        </>
    );
}

interface ClientRowProps {
    client: ClientRow;
    cfg: { label: string; bg: string; fg: string; dot: string; ring: string };
    gridCols: string;
    showLogo: boolean;
    showContact: boolean;
    showTerms: boolean;
    showBalance: boolean;
    isCompact: boolean;
    onDelete: (client: ClientRow) => void;
}

function ClientRowItem({
    client,
    cfg,
    gridCols,
    showLogo,
    showContact,
    showTerms,
    showBalance,
    isCompact,
    onDelete,
}: ClientRowProps) {
    const [hoverView, setHoverView] = useState(false);
    const [hoverEdit, setHoverEdit] = useState(false);
    const [hoverDelete, setHoverDelete] = useState(false);
    const [hoverRow, setHoverRow] = useState(false);

    const balance = client.balance ?? 0;
    const isOverLimit = balance > client.credit_limit;
    const balanceColor = isOverLimit ? '#B14C3C' : '#123238';

    return (
        <div
            onMouseEnter={() => setHoverRow(true)}
            onMouseLeave={() => setHoverRow(false)}
            style={{
                display: 'grid',
                gridTemplateColumns: gridCols,
                gap: '10px',
                alignItems: 'center',
                padding: '10px 20px',
                borderBottom: '1px solid #F4F8F9',
                background: hoverRow ? '#F8FBFB' : '#FFFFFF',
            }}
        >
            {/* Logo */}
            {showLogo && (
                <div
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        background: '#E3F1F3',
                        border: '1px solid #E0EBED',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        position: 'relative',
                    }}
                >
                    {client.logo_path ? (
                        <img
                            src={`/storage/${client.logo_path}`}
                            alt=""
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                            onError={(e) => {
                                (
                                    e.currentTarget as HTMLImageElement
                                ).style.display = 'none';
                            }}
                        />
                    ) : (
                        <span
                            style={{
                                fontFamily: "'Bitter', Georgia, serif",
                                fontWeight: 600,
                                fontSize: '14px',
                                color: '#1a4e57',
                                lineHeight: 1,
                            }}
                        >
                            {client.initials}
                        </span>
                    )}
                </div>
            )}

            {/* Client name + kind/tax_id */}
            <div style={{ minWidth: 0 }}>
                <div
                    style={{
                        fontSize: '13.5px',
                        fontWeight: 500,
                        color: '#123238',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    {client.name}
                    {isCompact && (
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '11px',
                                fontWeight: 500,
                                padding: '2px 8px',
                                borderRadius: '20px',
                                border: `1px solid ${cfg.ring}`,
                                background: cfg.bg,
                                color: cfg.fg,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                            }}
                        >
                            <span
                                style={{
                                    width: '5px',
                                    height: '5px',
                                    borderRadius: '50%',
                                    background: cfg.dot,
                                    flexShrink: 0,
                                }}
                            />
                            {cfg.label}
                        </span>
                    )}
                </div>
                <div
                    style={{
                        fontSize: '11px',
                        color: '#7E9AA0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {client.kind} · {client.tax_id}
                </div>
            </div>

            {/* Primary contact */}
            {showContact && (
                <div style={{ minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: '12.5px',
                            color: '#3D5F66',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {client.contact_name ?? '—'}
                    </div>
                    {client.contact_phone && (
                        <div
                            style={{
                                fontSize: '11px',
                                color: '#7E9AA0',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {client.contact_phone}
                        </div>
                    )}
                </div>
            )}

            {/* Terms */}
            {showTerms && (
                <div
                    style={{
                        fontSize: '12.5px',
                        color: '#3D5F66',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {client.payment_terms}
                </div>
            )}

            {/* Balance */}
            {showBalance && (
                <div style={{ textAlign: 'right', minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: '12.5px',
                            fontWeight: 500,
                            color: balanceColor,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {formatMoney(balance)}
                    </div>
                    <div
                        style={{
                            fontSize: '11px',
                            color: '#7E9AA0',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        de {formatMoney(client.credit_limit)}
                    </div>
                </div>
            )}

            {/* Status chip */}
            {!isCompact && (
                <div style={{ minWidth: 0 }}>
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11.5px',
                            fontWeight: 500,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            border: `1px solid ${cfg.ring}`,
                            background: cfg.bg,
                            color: cfg.fg,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <span
                            style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: cfg.dot,
                                flexShrink: 0,
                            }}
                        />
                        {cfg.label}
                    </span>
                </div>
            )}

            {/* Compact status placeholder — already shown inline in name column */}
            {isCompact && <div />}

            {/* Actions */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '6px',
                }}
            >
                <button
                    onClick={() => router.get(`/clients/${client.id}`)}
                    onMouseEnter={() => setHoverView(true)}
                    onMouseLeave={() => setHoverView(false)}
                    title="Ver cliente"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        border: `1px solid ${hoverView ? '#4a909f' : '#DCE8EA'}`,
                        background: hoverView ? '#EDF8F9' : '#FFFFFF',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        padding: 0,
                        flexShrink: 0,
                    }}
                >
                    <Eye size={14} strokeWidth={1.5} color="#1a4e57" />
                </button>
                <button
                    onClick={() => router.get(`/clients/${client.id}/edit`)}
                    onMouseEnter={() => setHoverEdit(true)}
                    onMouseLeave={() => setHoverEdit(false)}
                    title="Editar cliente"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        border: `1px solid ${hoverEdit ? '#4a909f' : '#DCE8EA'}`,
                        background: hoverEdit ? '#EDF8F9' : '#FFFFFF',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        padding: 0,
                        flexShrink: 0,
                    }}
                >
                    <Pencil size={14} strokeWidth={1.5} color="#4a909f" />
                </button>
                <button
                    onClick={() => onDelete(client)}
                    onMouseEnter={() => setHoverDelete(true)}
                    onMouseLeave={() => setHoverDelete(false)}
                    title="Eliminar cliente"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        border: `1px solid ${hoverDelete ? '#D9A79D' : '#DCE8EA'}`,
                        background: hoverDelete ? '#FCEFEC' : '#FFFFFF',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        padding: 0,
                        flexShrink: 0,
                    }}
                >
                    <Trash2 size={14} strokeWidth={1.5} color="#B14C3C" />
                </button>
            </div>
        </div>
    );
}
