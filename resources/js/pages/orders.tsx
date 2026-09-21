import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'open' | 'ready' | 'invoiced' | 'cancelled';
type TripStatus =
    | 'Scheduled'
    | 'At port'
    | 'On the road'
    | 'Paused'
    | 'Delayed'
    | 'Completed'
    | 'Cancelled';

interface OrderRow {
    id: number;
    order_number: string;
    client: string;
    client_id: number | null;
    date: string | null;
    from: string | null;
    to: string | null;
    truck: string | null;
    driver: string | null;
    trip_status: TripStatus | null;
    status: OrderStatus;
    rate: number;
    trip_id: number;
}

interface PageProps {
    pendingInvoice: number;
    overdueOpen: number;
    dueToday: number;
    orders: OrderRow[];
}

// ─── Status configs ───────────────────────────────────────────────────────────

const ORDER_STATUS: Record<
    OrderStatus,
    { bg: string; fg: string; dot: string; label: string }
> = {
    open: { bg: '#EEF3F4', fg: '#3D5F66', dot: '#7FA3AB', label: 'Abierta' },
    ready: {
        bg: '#E6F4EC',
        fg: '#1F5C3D',
        dot: '#2E8055',
        label: 'Lista para facturar',
    },
    invoiced: {
        bg: '#EAF2FA',
        fg: '#2C4E72',
        dot: '#5B84B1',
        label: 'Facturada',
    },
    cancelled: {
        bg: '#F0EFEF',
        fg: '#595959',
        dot: '#9B9B9B',
        label: 'Cancelada',
    },
};

const TRIP_STATUS: Record<TripStatus, { bg: string; fg: string; dot: string }> =
    {
        Scheduled: { bg: '#EEF3F4', fg: '#3D5F66', dot: '#7FA3AB' },
        'At port': { bg: '#EAF2FA', fg: '#2C4E72', dot: '#5B84B1' },
        'On the road': { bg: '#E6F4EC', fg: '#1F5C3D', dot: '#2E8055' },
        Paused: { bg: '#FBF2E1', fg: '#7A5210', dot: '#C68A1E' },
        Delayed: { bg: '#FBEAE7', fg: '#8A2A21', dot: '#C4483A' },
        Completed: { bg: '#E9EFF0', fg: '#40595E', dot: '#8AA4A9' },
        Cancelled: { bg: '#F0EFEF', fg: '#595959', dot: '#9B9B9B' },
    };

const STATUS_TABS: { key: string; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'open', label: 'Abierta' },
    { key: 'ready', label: 'Lista' },
    { key: 'invoiced', label: 'Facturada' },
    { key: 'cancelled', label: 'Cancelada' },
];

// ─── KpiCard ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
    label: string;
    value: string | number;
    sub?: string;
    accent?: string;
}

function KpiCard({ label, value, sub, accent }: KpiCardProps) {
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
                    color: accent ?? '#123238',
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

// ─── StatusChip ───────────────────────────────────────────────────────────────

function StatusChip({
    status,
    cfg,
}: {
    status: string;
    cfg: { bg: string; fg: string; dot: string };
}) {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: cfg.bg,
                color: cfg.fg,
                borderRadius: '100px',
                padding: '3px 10px',
                fontSize: '12px',
                fontWeight: 500,
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
            {({ Scheduled: 'Programado', 'At port': 'En puerto', 'On the road': 'En ruta', Paused: 'Pausado', Delayed: 'Retrasado', Completed: 'Completado', Cancelled: 'Cancelado' } as Record<string,string>)[status] ?? status}
        </span>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string | null): string {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${m}/${day}/${y}`;
}

// ─── Orders index ─────────────────────────────────────────────────────────────

export default function Orders({
    pendingInvoice,
    overdueOpen,
    dueToday,
    orders,
}: PageProps) {
    const [query, setQuery] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [truckFilter, setTruckFilter] = useState('');
    const [driverFilter, setDriverFilter] = useState('');

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

    const tier = containerW >= 1100 ? 'full' : 'compact';

    // Unique truck/driver lists for selects
    const trucks = useMemo(
        () =>
            [...new Set(orders.map((o) => o.truck).filter(Boolean))].sort(
                (a, b) => (a as string).localeCompare(b as string),
            ) as string[],
        [orders],
    );
    const drivers = useMemo(
        () =>
            [...new Set(orders.map((o) => o.driver).filter(Boolean))].sort(
                (a, b) => (a as string).localeCompare(b as string),
            ) as string[],
        [orders],
    );

    const filtered = useMemo(() => {
        return orders.filter((o) => {
            if (statusTab !== 'all' && o.status !== statusTab) return false;
            if (dateFrom && o.date && o.date < dateFrom) return false;
            if (dateTo && o.date && o.date > dateTo) return false;
            if (truckFilter && o.truck !== truckFilter) return false;
            if (driverFilter && o.driver !== driverFilter) return false;
            if (query.trim()) {
                const q = query.toLowerCase();
                const matchClient = o.client.toLowerCase().includes(q);
                const matchNum = o.order_number.toLowerCase().includes(q);
                const matchRoute = `${o.from ?? ''} ${o.to ?? ''}`
                    .toLowerCase()
                    .includes(q);
                if (!matchClient && !matchNum && !matchRoute) return false;
            }
            return true;
        });
    }, [orders, statusTab, dateFrom, dateTo, truckFilter, driverFilter, query]);

    const thStyle: React.CSSProperties = {
        fontSize: '10.5px',
        fontWeight: 500,
        color: '#8AA4A9',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        padding: '0 10px 10px',
        whiteSpace: 'nowrap',
    };

    const gridCols =
        tier === 'full'
            ? '80px minmax(0,1.4fr) 100px minmax(0,1.2fr) 140px 130px 140px 90px'
            : '80px minmax(0,1fr) 100px 130px 90px';

    const showRoute = tier === 'full';
    const showTruckCol = tier === 'full';
    const showTripStatus = tier === 'full';

    return (
        <>
            <Head title="Órdenes" />

            {/* KPI row */}
            <div
                style={{
                    display: 'flex',
                    gap: '14px',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                }}
            >
                <KpiCard
                    label="Facturación pendiente"
                    value={pendingInvoice}
                    sub="Listas para facturar"
                    accent={pendingInvoice > 0 ? '#1F5C3D' : '#123238'}
                />
                <KpiCard
                    label="Vencidas abiertas"
                    value={overdueOpen}
                    sub="Pasó la fecha, aún abiertas"
                    accent={overdueOpen > 0 ? '#8A2A21' : '#123238'}
                />
                <KpiCard
                    label="Vencen hoy"
                    value={dueToday}
                    sub="Órdenes abiertas que vencen hoy"
                />
            </div>

            {/* Main card */}
            <div
                ref={containerRef}
                style={{
                    background: '#FFFFFF',
                    border: '1px solid #E0EBED',
                    borderRadius: '14px',
                    overflow: 'hidden',
                }}
            >
                {/* Card header */}
                <div
                    style={{
                        padding: '18px 20px 14px',
                        borderBottom: '1px solid #EFF5F6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "'Bitter', Georgia, serif",
                                fontWeight: 600,
                                fontSize: '16px',
                                color: '#123238',
                            }}
                        >
                            Órdenes
                        </span>
                        <span
                            style={{
                                fontSize: '12px',
                                background: '#EDF3F4',
                                color: '#3D5F66',
                                borderRadius: '100px',
                                padding: '2px 10px',
                                fontWeight: 500,
                            }}
                        >
                            {filtered.length}
                        </span>
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Buscar cliente, orden #, ruta…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{
                                fontSize: '13px',
                                border: '1px solid #DCE8EA',
                                borderRadius: '8px',
                                padding: '7px 12px 7px 34px',
                                width: '240px',
                                background: '#F8FBFB',
                                color: '#123238',
                                outline: 'none',
                            }}
                        />
                        <svg
                            style={{
                                position: 'absolute',
                                left: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#8AA4A9',
                            }}
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </div>

                    {/* Status tabs */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '3px',
                            background: '#F2F7F8',
                            border: '1px solid #E0EBED',
                            borderRadius: '10px',
                            padding: '3px',
                        }}
                    >
                        {STATUS_TABS.map((tab) => {
                            const isActive = statusTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setStatusTab(tab.key)}
                                    style={{
                                        padding: '4px 12px',
                                        borderRadius: '7px',
                                        border: 'none',
                                        background: isActive
                                            ? '#FFFFFF'
                                            : 'transparent',
                                        boxShadow: isActive
                                            ? '0 1px 4px rgba(18,50,56,0.1)'
                                            : 'none',
                                        fontSize: '12px',
                                        fontWeight: isActive ? 600 : 400,
                                        color: isActive ? '#1a4e57' : '#5E7A80',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Filter row */}
                <div
                    style={{
                        padding: '10px 20px',
                        borderBottom: '1px solid #EFF5F6',
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        background: '#FAFCFD',
                    }}
                >
                    <span
                        style={{
                            fontSize: '11.5px',
                            color: '#8AA4A9',
                            fontWeight: 500,
                            marginRight: '2px',
                        }}
                    >
                        Filtros:
                    </span>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        style={filterInputStyle}
                        title="Fecha desde"
                    />
                    <span style={{ fontSize: '12px', color: '#9DB3B8' }}>
                        →
                    </span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        style={filterInputStyle}
                        title="Fecha hasta"
                    />
                    <select
                        value={truckFilter}
                        onChange={(e) => setTruckFilter(e.target.value)}
                        style={filterInputStyle}
                    >
                        <option value="">Todos los camiones</option>
                        {trucks.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                    <select
                        value={driverFilter}
                        onChange={(e) => setDriverFilter(e.target.value)}
                        style={filterInputStyle}
                    >
                        <option value="">Todos los choferes</option>
                        {drivers.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                    {(dateFrom || dateTo || truckFilter || driverFilter) && (
                        <button
                            onClick={() => {
                                setDateFrom('');
                                setDateTo('');
                                setTruckFilter('');
                                setDriverFilter('');
                            }}
                            style={{
                                fontSize: '12px',
                                color: '#C4483A',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px 6px',
                            }}
                        >
                            Limpiar
                        </button>
                    )}
                </div>

                {/* Grid header */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: gridCols,
                        alignItems: 'center',
                        padding: '10px 20px 0',
                        borderBottom: '1px solid #EFF5F6',
                    }}
                >
                    <span style={thStyle}>#</span>
                    <span style={thStyle}>Cliente</span>
                    <span style={thStyle}>Fecha</span>
                    {showRoute && <span style={thStyle}>Ruta</span>}
                    {showTruckCol && (
                        <span style={thStyle}>Camión / Chofer</span>
                    )}
                    {showTripStatus && <span style={thStyle}>Estado del viaje</span>}
                    <span style={thStyle}>Estado de orden</span>
                    <span style={{ ...thStyle, textAlign: 'right' }}>
                        Acción
                    </span>
                </div>

                {/* Rows */}
                {filtered.length === 0 ? (
                    <div
                        style={{
                            padding: '48px 20px',
                            textAlign: 'center',
                            fontSize: '13px',
                            color: '#9DB3B8',
                        }}
                    >
                        Ninguna orden coincide con los filtros.
                    </div>
                ) : (
                    filtered.map((order) => {
                        const osCfg = ORDER_STATUS[order.status];
                        const tsCfg = order.trip_status
                            ? TRIP_STATUS[order.trip_status]
                            : null;
                        return (
                            <div
                                key={order.id}
                                onClick={() =>
                                    router.get(`/orders/${order.id}`)
                                }
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: gridCols,
                                    alignItems: 'center',
                                    padding: '11px 20px',
                                    borderBottom: '1px solid #EFF5F6',
                                    cursor: 'pointer',
                                    transition: 'background 0.1s',
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                        '#F8FBFB')
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                        'transparent')
                                }
                            >
                                {/* Order number */}
                                <span
                                    style={{
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: '#1a4e57',
                                        fontFamily: 'monospace',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        paddingRight: '8px',
                                    }}
                                >
                                    {order.order_number}
                                </span>

                                {/* Client */}
                                <span
                                    style={{
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        color: '#123238',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        paddingRight: '8px',
                                    }}
                                >
                                    {order.client || '—'}
                                </span>

                                {/* Date */}
                                <span
                                    style={{
                                        fontSize: '12.5px',
                                        color: '#5E7A80',
                                    }}
                                >
                                    {formatDate(order.date)}
                                </span>

                                {/* Route */}
                                {showRoute && (
                                    <span
                                        style={{
                                            fontSize: '12px',
                                            color: '#5E7A80',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            paddingRight: '8px',
                                        }}
                                    >
                                        {order.from && order.to
                                            ? `${order.from} → ${order.to}`
                                            : '—'}
                                    </span>
                                )}

                                {/* Truck / Driver */}
                                {showTruckCol && (
                                    <div style={{ overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                color: '#123238',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {order.truck ?? (
                                                <span
                                                    style={{ color: '#C4483A' }}
                                                >
                                                    Sin camión
                                                </span>
                                            )}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '11.5px',
                                                color: '#9DB3B8',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {order.driver ?? '—'}
                                        </div>
                                    </div>
                                )}

                                {/* Trip status */}
                                {showTripStatus && (
                                    <div>
                                        {tsCfg && order.trip_status ? (
                                            <StatusChip
                                                status={order.trip_status}
                                                cfg={tsCfg}
                                            />
                                        ) : (
                                            <span
                                                style={{
                                                    fontSize: '12px',
                                                    color: '#9DB3B8',
                                                }}
                                            >
                                                —
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Order status */}
                                <div>
                                    <StatusChip
                                        status={osCfg.label}
                                        cfg={osCfg}
                                    />
                                </div>

                                {/* Action */}
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.get(`/orders/${order.id}`);
                                        }}
                                        style={{
                                            fontSize: '12px',
                                            padding: '5px 12px',
                                            borderRadius: '7px',
                                            border: '1px solid #DCE8EA',
                                            background: '#F2F7F8',
                                            color: '#3D5F66',
                                            cursor: 'pointer',
                                            fontWeight: 500,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        Ver
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Footer */}
                <div
                    style={{
                        padding: '12px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px',
                        borderTop:
                            filtered.length > 0 ? '1px solid #EFF5F6' : 'none',
                    }}
                >
                    <span style={{ fontSize: '12px', color: '#9DB3B8' }}>
                        Mostrando {filtered.length} de {orders.length} orden
                        {orders.length !== 1 ? 'es' : ''}
                    </span>
                </div>
            </div>
        </>
    );
}

const filterInputStyle: React.CSSProperties = {
    fontSize: '12.5px',
    border: '1px solid #DCE8EA',
    borderRadius: '7px',
    padding: '5px 10px',
    background: '#F8FBFB',
    color: '#123238',
    outline: 'none',
};
