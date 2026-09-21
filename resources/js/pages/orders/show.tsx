import { Head, router } from '@inertiajs/react';

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

interface TripDetail {
    id: number;
    type: 'import' | 'export';
    from: string | null;
    to: string | null;
    status: TripStatus;
    truck: string | null;
    driver: string | null;
    line: string | null;
    container_number: string | null;
    container_size: string | null;
    cargo_type: string | null;
    weight_tons: number | null;
    km: number | null;
    rate: number;
    fuel_cost: number;
    toll_cost: number;
    driver_pay: number;
    margin: number;
}

interface OrderDetail {
    id: number;
    order_number: string;
    client: string;
    date: string | null;
    status: OrderStatus;
    completed_at: string | null;
    invoiced_at: string | null;
    trip: TripDetail | null;
}

interface PageProps {
    order: OrderDetail;
}

// ─── Status configs ───────────────────────────────────────────────────────────

const ORDER_STATUS: Record<
    OrderStatus,
    { bg: string; fg: string; dot: string; label: string }
> = {
    open: { bg: '#EEF3F4', fg: '#3D5F66', dot: '#7FA3AB', label: 'Open' },
    ready: {
        bg: '#E6F4EC',
        fg: '#1F5C3D',
        dot: '#2E8055',
        label: 'Ready to Invoice',
    },
    invoiced: {
        bg: '#EAF2FA',
        fg: '#2C4E72',
        dot: '#5B84B1',
        label: 'Invoiced',
    },
    cancelled: {
        bg: '#F0EFEF',
        fg: '#595959',
        dot: '#9B9B9B',
        label: 'Cancelled',
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMoney(n: number): string {
    return (
        'RD$ ' +
        n.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    );
}

function formatDate(d: string | null): string {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${m}/${day}/${y}`;
}

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
                gap: '6px',
                background: cfg.bg,
                color: cfg.fg,
                borderRadius: '100px',
                padding: '4px 12px',
                fontSize: '13px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
            }}
        >
            <span
                style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: cfg.dot,
                    flexShrink: 0,
                }}
            />
            {status}
        </span>
    );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                background: '#FFFFFF',
                border: '1px solid #E0EBED',
                borderRadius: '14px',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid #EFF5F6',
                    background: '#F8FBFB',
                }}
            >
                <span
                    style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#5E7A80',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                    }}
                >
                    {title}
                </span>
            </div>
            <div style={{ padding: '16px 20px' }}>{children}</div>
        </div>
    );
}

function DetailRow({
    label,
    value,
    accent,
}: {
    label: string;
    value: React.ReactNode;
    accent?: string;
}) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '6px 0',
                borderBottom: '1px solid #F2F7F8',
            }}
        >
            <span
                style={{ fontSize: '12.5px', color: '#8AA4A9', flexShrink: 0 }}
            >
                {label}
            </span>
            <span
                style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: accent ?? '#123238',
                    textAlign: 'right',
                }}
            >
                {value ?? '—'}
            </span>
        </div>
    );
}

// ─── Show page ────────────────────────────────────────────────────────────────

export default function OrderShow({ order }: PageProps) {
    const osCfg = ORDER_STATUS[order.status];
    const t = order.trip;
    const tsCfg = t?.status ? TRIP_STATUS[t.status] : null;

    function handleComplete() {
        if (!confirm('Mark this order as ready to invoice?')) return;
        router.patch(`/orders/${order.id}/complete`);
    }

    return (
        <>
            <Head title={`Order ${order.order_number}`} />

            {/* Back link */}
            <div style={{ marginBottom: '18px' }}>
                <button
                    onClick={() => router.get('/orders')}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        color: '#5E7A80',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                    }}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M19 12H5" />
                        <path d="m12 19-7-7 7-7" />
                    </svg>
                    Back to Orders
                </button>
            </div>

            {/* Page header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    flexWrap: 'wrap',
                    marginBottom: '20px',
                }}
            >
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontFamily: "'Bitter', Georgia, serif",
                            fontWeight: 700,
                            fontSize: '26px',
                            color: '#123238',
                            lineHeight: 1.1,
                        }}
                    >
                        {order.order_number}
                    </div>
                    <div
                        style={{
                            fontSize: '13px',
                            color: '#5E7A80',
                            marginTop: '4px',
                        }}
                    >
                        {order.client || '—'} &nbsp;·&nbsp;{' '}
                        {formatDate(order.date)}
                    </div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap',
                    }}
                >
                    <StatusChip status={osCfg.label} cfg={osCfg} />
                </div>
            </div>

            {/* Two-column layout */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)',
                    gap: '16px',
                    alignItems: 'start',
                }}
                className="order-show-grid"
            >
                {/* Left column: Trip details */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                    }}
                >
                    <SectionCard title="Trip Details">
                        <DetailRow label="Client" value={order.client || '—'} />
                        <DetailRow
                            label="Type"
                            value={
                                t?.type
                                    ? t.type.charAt(0).toUpperCase() +
                                      t.type.slice(1)
                                    : '—'
                            }
                        />
                        <DetailRow label="Carrier" value={t?.line ?? '—'} />
                        <DetailRow
                            label="Route"
                            value={
                                t?.from && t?.to ? `${t.from} → ${t.to}` : '—'
                            }
                        />
                        <DetailRow
                            label="Truck"
                            value={
                                t?.truck ?? (
                                    <span style={{ color: '#C4483A' }}>
                                        Not assigned
                                    </span>
                                )
                            }
                        />
                        <DetailRow
                            label="Driver"
                            value={
                                t?.driver ?? (
                                    <span style={{ color: '#C4483A' }}>
                                        Not assigned
                                    </span>
                                )
                            }
                        />
                        <DetailRow
                            label="Distance"
                            value={t?.km ? `${t.km} km` : '—'}
                        />
                    </SectionCard>

                    <SectionCard title="Container">
                        <DetailRow
                            label="Container #"
                            value={t?.container_number ?? '—'}
                        />
                        <DetailRow
                            label="Size"
                            value={t?.container_size ?? '—'}
                        />
                        <DetailRow
                            label="Cargo Type"
                            value={t?.cargo_type ?? '—'}
                        />
                        <DetailRow
                            label="Weight"
                            value={
                                t?.weight_tons ? `${t.weight_tons} tons` : '—'
                            }
                        />
                    </SectionCard>
                </div>

                {/* Right column: Financials + Status */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                    }}
                >
                    <SectionCard title="Financials">
                        <DetailRow
                            label="Rate"
                            value={formatMoney(t?.rate ?? 0)}
                            accent="#1a4e57"
                        />
                        <DetailRow
                            label="Fuel Cost"
                            value={formatMoney(t?.fuel_cost ?? 0)}
                        />
                        <DetailRow
                            label="Toll Cost"
                            value={formatMoney(t?.toll_cost ?? 0)}
                        />
                        <DetailRow
                            label="Driver Pay"
                            value={formatMoney(t?.driver_pay ?? 0)}
                        />
                        <div
                            style={{
                                marginTop: '6px',
                                paddingTop: '6px',
                                borderTop: '1px solid #DCE8EA',
                            }}
                        >
                            <DetailRow
                                label="Margin"
                                value={formatMoney(t?.margin ?? 0)}
                                accent={
                                    (t?.margin ?? 0) >= 0
                                        ? '#1F5C3D'
                                        : '#8A2A21'
                                }
                            />
                        </div>
                    </SectionCard>

                    <SectionCard title="Status">
                        {/* Trip status */}
                        <div style={{ marginBottom: '12px' }}>
                            <div
                                style={{
                                    fontSize: '11.5px',
                                    color: '#8AA4A9',
                                    marginBottom: '6px',
                                }}
                            >
                                Trip Status
                            </div>
                            {tsCfg && t?.status ? (
                                <StatusChip status={t.status} cfg={tsCfg} />
                            ) : (
                                <span
                                    style={{
                                        fontSize: '13px',
                                        color: '#9DB3B8',
                                    }}
                                >
                                    —
                                </span>
                            )}
                        </div>

                        {/* Order status details */}
                        <div style={{ marginBottom: '12px' }}>
                            <div
                                style={{
                                    fontSize: '11.5px',
                                    color: '#8AA4A9',
                                    marginBottom: '6px',
                                }}
                            >
                                Order Status
                            </div>
                            <StatusChip status={osCfg.label} cfg={osCfg} />
                        </div>

                        {/* Completed at */}
                        {order.completed_at && (
                            <div
                                style={{
                                    fontSize: '12px',
                                    color: '#5E7A80',
                                    marginBottom: '8px',
                                }}
                            >
                                Completed: <strong>{order.completed_at}</strong>
                            </div>
                        )}

                        {/* Invoiced at */}
                        {order.invoiced_at && (
                            <div
                                style={{
                                    fontSize: '12px',
                                    color: '#5E7A80',
                                    marginBottom: '8px',
                                }}
                            >
                                Invoiced: <strong>{order.invoiced_at}</strong>
                            </div>
                        )}

                        {/* Complete button */}
                        {order.status === 'open' && (
                            <button
                                onClick={handleComplete}
                                style={{
                                    marginTop: '8px',
                                    width: '100%',
                                    padding: '10px 16px',
                                    background: '#1a4e57',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '9px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    letterSpacing: '0.02em',
                                }}
                            >
                                Complete Order
                            </button>
                        )}

                        {order.status === 'ready' && (
                            <div
                                style={{
                                    marginTop: '8px',
                                    padding: '10px 16px',
                                    background: '#E6F4EC',
                                    border: '1px solid #B8E0C4',
                                    borderRadius: '9px',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: '#1F5C3D',
                                    textAlign: 'center',
                                }}
                            >
                                Ready to Invoice
                                {order.completed_at && (
                                    <div
                                        style={{
                                            fontSize: '11.5px',
                                            fontWeight: 400,
                                            color: '#4A8C6A',
                                            marginTop: '3px',
                                        }}
                                    >
                                        Since {order.completed_at}
                                    </div>
                                )}
                            </div>
                        )}

                        {order.status === 'cancelled' && (
                            <div
                                style={{
                                    marginTop: '8px',
                                    padding: '10px 16px',
                                    background: '#F0EFEF',
                                    border: '1px solid #D5D2D2',
                                    borderRadius: '9px',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: '#595959',
                                    textAlign: 'center',
                                }}
                            >
                                Cancelled
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>

            {/* Responsive style override */}
            <style>{`
                @media (max-width: 860px) {
                    .order-show-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </>
    );
}
