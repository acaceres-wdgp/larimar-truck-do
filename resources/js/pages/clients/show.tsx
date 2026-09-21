import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ClientData {
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

interface TripRow {
    id: number;
    date: string;
    type: 'import' | 'export';
    client: string;
    line: string | null;
    from_location: string;
    to_location: string;
    truck_plate: string | null;
    driver_name: string | null;
    status: string;
    km: number;
}

interface Metrics {
    trips_total: number;
    completed: number;
    distance_km: number;
    last_trip_date: string | null;
}

interface PageProps {
    client: ClientData;
    trips: TripRow[];
    metrics: Metrics;
}

const CLIENT_STATUS_CFG = {
    Active: {
        label: 'Active',
        bg: '#E6F4EC',
        fg: '#1F5C3D',
        dot: '#2E8055',
        ring: '#B8E0C4',
    },
    Inactive: {
        label: 'Inactive',
        bg: '#F2F4F5',
        fg: '#4A5568',
        dot: '#718096',
        ring: '#CBD5E0',
    },
};

const TRIP_STATUS_CFG: Record<
    string,
    { bg: string; fg: string; dot: string; ring: string }
> = {
    Completed: {
        bg: '#E6F4EC',
        fg: '#1F5C3D',
        dot: '#2E8055',
        ring: '#B8E0C4',
    },
    'On the road': {
        bg: '#EAF2FA',
        fg: '#2C4E72',
        dot: '#5B84B1',
        ring: '#B3CCE8',
    },
    Scheduled: {
        bg: '#F2F4F5',
        fg: '#4A5568',
        dot: '#718096',
        ring: '#CBD5E0',
    },
    'At port': {
        bg: '#E3F3F3',
        fg: '#2C6E6E',
        dot: '#3D8C8C',
        ring: '#A8D8D8',
    },
    Paused: { bg: '#FBF2E1', fg: '#7A5210', dot: '#C68A1E', ring: '#E8D5A3' },
    Delayed: { bg: '#FBEAE7', fg: '#8A2A21', dot: '#C4483A', ring: '#E8C1BC' },
};

function formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];
    return `${months[m - 1]} ${d}, ${y}`;
}

function formatMoney(n: number): string {
    return 'RD$ ' + n.toLocaleString('en-US');
}

export default function ClientShow({ client, trips, metrics }: PageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerW, setContainerW] = useState(1200);
    const tripsCardRef = useRef<HTMLDivElement>(null);
    const [tripsW, setTripsW] = useState(800);
    const balanceCardRef = useRef<HTMLDivElement>(null);
    const [balanceCardW, setBalanceCardW] = useState(600);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const e = entries[0];
            if (e) setContainerW(e.contentRect.width);
        });
        ro.observe(el);
        setContainerW(el.getBoundingClientRect().width);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const el = tripsCardRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const e = entries[0];
            if (e) setTripsW(e.contentRect.width);
        });
        ro.observe(el);
        setTripsW(el.getBoundingClientRect().width);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const el = balanceCardRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const e = entries[0];
            if (e) setBalanceCardW(e.contentRect.width);
        });
        ro.observe(el);
        setBalanceCardW(el.getBoundingClientRect().width);
        return () => ro.disconnect();
    }, []);

    const twoCol = containerW >= 1080;
    const statusCfg = CLIENT_STATUS_CFG[client.status];

    const tripTier =
        tripsW >= 1240 ? 'full' : tripsW >= 940 ? 'mid' : 'compact';
    const tripGridCols =
        tripTier === 'full'
            ? '104px minmax(0,1.4fr) 140px 108px 84px 132px'
            : tripTier === 'mid'
              ? '104px minmax(0,1.4fr) 140px 132px'
              : '96px minmax(0,1fr) 124px';

    const balance = client.balance ?? 0;
    const creditLimit = client.credit_limit ?? 0;
    const available = creditLimit - balance;
    const isOverLimit = balance > creditLimit;
    const creditUsedPct =
        creditLimit > 0 ? Math.min((balance / creditLimit) * 100, 100) : 0;
    const barColor =
        creditUsedPct >= 100
            ? '#C4483A'
            : creditUsedPct >= 80
              ? '#C68A1E'
              : '#2E8055';

    const today = new Date();
    const todayFormatted = formatDate(today.toISOString().slice(0, 10));

    const thStyle: React.CSSProperties = {
        fontSize: '10.5px',
        fontWeight: 500,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: '#5E7A80',
    };

    const fieldLabelStyle: React.CSSProperties = {
        fontSize: '10.5px',
        fontWeight: 500,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: '#7E9AA0',
        marginBottom: '3px',
    };

    const fieldValueStyle: React.CSSProperties = {
        fontSize: '13.5px',
        color: '#123238',
    };

    return (
        <>
            <Head title={client.name} />

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
                        Home /{' '}
                        <Link
                            href="/clients"
                            style={{ color: '#4a909f', textDecoration: 'none' }}
                        >
                            Clients
                        </Link>{' '}
                        / {client.name}
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
                        {client.name}
                    </h2>
                </div>
                <div style={{ display: 'flex', gap: '9px' }}>
                    <button
                        onClick={() => router.get('/clients')}
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
                        Back to clients
                    </button>
                    <button
                        onClick={() => router.get(`/clients/${client.id}/edit`)}
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
                        <Pencil size={14} strokeWidth={1.5} color="#b9f7fc" />
                        Edit client
                    </button>
                </div>
            </div>

            {/* Two-column layout */}
            <div
                ref={containerRef}
                style={{
                    display: 'grid',
                    gridTemplateColumns: twoCol ? '0.85fr 1.6fr' : '1fr',
                    gap: '18px',
                    alignItems: 'start',
                }}
            >
                {/* Left column: ficha card */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                    }}
                >
                    <section
                        style={{
                            background: '#FFFFFF',
                            border: '1px solid #E0EBED',
                            borderRadius: '14px',
                            overflow: 'hidden',
                        }}
                    >
                        <div style={{ padding: '18px 18px 16px' }}>
                            {/* Logo square */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    marginBottom: '16px',
                                }}
                            >
                                <div
                                    style={{
                                        width: '110px',
                                        height: '110px',
                                        borderRadius: '14px',
                                        overflow: 'hidden',
                                        background: '#E3F1F3',
                                        border: '1px solid #E0EBED',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '12px',
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
                                                fontFamily:
                                                    "'Bitter', Georgia, serif",
                                                fontWeight: 600,
                                                fontSize: '32px',
                                                color: '#1a4e57',
                                                lineHeight: 1,
                                            }}
                                        >
                                            {client.initials}
                                        </span>
                                    )}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Bitter', Georgia, serif",
                                        fontWeight: 600,
                                        fontSize: '18px',
                                        color: '#123238',
                                        marginBottom: '8px',
                                        letterSpacing: '-0.015em',
                                        textAlign: 'center',
                                    }}
                                >
                                    {client.name}
                                </div>
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '11.5px',
                                        fontWeight: 500,
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        border: `1px solid ${statusCfg.ring}`,
                                        background: statusCfg.bg,
                                        color: statusCfg.fg,
                                    }}
                                >
                                    <span
                                        style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: statusCfg.dot,
                                            flexShrink: 0,
                                        }}
                                    />
                                    {statusCfg.label}
                                </span>
                            </div>

                            {/* Field grid */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '14px 12px',
                                }}
                            >
                                <div>
                                    <div style={fieldLabelStyle}>
                                        Client type
                                    </div>
                                    <div style={fieldValueStyle}>
                                        {client.kind}
                                    </div>
                                </div>
                                <div>
                                    <div style={fieldLabelStyle}>
                                        RNC / Tax ID
                                    </div>
                                    <div style={fieldValueStyle}>
                                        {client.tax_id}
                                    </div>
                                </div>
                                <div>
                                    <div style={fieldLabelStyle}>
                                        Primary contact
                                    </div>
                                    <div style={fieldValueStyle}>
                                        {client.contact_name ?? '—'}
                                    </div>
                                </div>
                                <div>
                                    <div style={fieldLabelStyle}>Role</div>
                                    <div style={fieldValueStyle}>
                                        {client.contact_role ?? '—'}
                                    </div>
                                </div>
                                <div>
                                    <div style={fieldLabelStyle}>Phone</div>
                                    <div style={fieldValueStyle}>
                                        {client.contact_phone ?? '—'}
                                    </div>
                                </div>
                                <div>
                                    <div style={fieldLabelStyle}>
                                        Payment terms
                                    </div>
                                    <div style={fieldValueStyle}>
                                        {client.payment_terms}
                                    </div>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={fieldLabelStyle}>Email</div>
                                    <div style={fieldValueStyle}>
                                        {client.contact_email ?? '—'}
                                    </div>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={fieldLabelStyle}>
                                        Client since
                                    </div>
                                    <div style={fieldValueStyle}>
                                        {client.client_since
                                            ? formatDate(client.client_since)
                                            : '—'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Metric stat cards */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '10px',
                        }}
                    >
                        {[
                            {
                                label: 'Trips on record',
                                value: String(metrics.trips_total),
                            },
                            {
                                label: 'Completed',
                                value: String(metrics.completed),
                            },
                            {
                                label: 'Distance (km)',
                                value: metrics.distance_km.toLocaleString(
                                    'en-US',
                                ),
                            },
                            {
                                label: 'Last trip',
                                value: metrics.last_trip_date
                                    ? formatDate(metrics.last_trip_date)
                                    : '—',
                            },
                        ].map((m) => (
                            <div
                                key={m.label}
                                style={{
                                    background: '#FFFFFF',
                                    border: '1px solid #E0EBED',
                                    borderRadius: '12px',
                                    padding: '14px 16px',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '10.5px',
                                        fontWeight: 500,
                                        letterSpacing: '0.06em',
                                        textTransform: 'uppercase',
                                        color: '#7E9AA0',
                                        marginBottom: '6px',
                                    }}
                                >
                                    {m.label}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Bitter', Georgia, serif",
                                        fontWeight: 600,
                                        fontSize: '21px',
                                        color: '#123238',
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {m.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                    }}
                >
                    {/* Balance & receivables card */}
                    <section
                        ref={balanceCardRef}
                        style={{
                            background: '#FFFFFF',
                            border: '1px solid #E0EBED',
                            borderRadius: '14px',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                padding: '18px 20px 15px',
                                borderBottom: '1px solid #EFF5F6',
                            }}
                        >
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
                                Balance &amp; receivables
                            </h3>
                            <div
                                style={{ fontSize: '12.5px', color: '#5E7A80' }}
                            >
                                Payment terms {client.payment_terms} · updated{' '}
                                {todayFormatted}
                            </div>
                        </div>

                        <div style={{ padding: '18px 20px' }}>
                            {/* 2×2 grid */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                        balanceCardW >= 500 ? '1fr 1fr' : '1fr',
                                    gap: '12px',
                                    marginBottom: '16px',
                                }}
                            >
                                {/* Outstanding */}
                                <div
                                    style={{
                                        background: '#F8FBFB',
                                        border: '1px solid #E0EBED',
                                        borderRadius: '10px',
                                        padding: '14px 16px',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: '10.5px',
                                            fontWeight: 500,
                                            letterSpacing: '0.06em',
                                            textTransform: 'uppercase',
                                            color: '#7E9AA0',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        Outstanding
                                    </div>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Bitter', Georgia, serif",
                                            fontWeight: 600,
                                            fontSize: '20px',
                                            color: '#123238',
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        {formatMoney(balance)}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            color: '#7E9AA0',
                                            marginTop: '4px',
                                        }}
                                    >
                                        {client.open_invoices} open invoices
                                    </div>
                                </div>

                                {/* Overdue 30+ */}
                                <div
                                    style={{
                                        background: '#F8FBFB',
                                        border: '1px solid #E0EBED',
                                        borderRadius: '10px',
                                        padding: '14px 16px',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: '10.5px',
                                            fontWeight: 500,
                                            letterSpacing: '0.06em',
                                            textTransform: 'uppercase',
                                            color: '#7E9AA0',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        Overdue 30+
                                    </div>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Bitter', Georgia, serif",
                                            fontWeight: 600,
                                            fontSize: '20px',
                                            color:
                                                client.overdue > 0
                                                    ? '#C4483A'
                                                    : '#123238',
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        {formatMoney(client.overdue ?? 0)}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            color:
                                                client.overdue > 0
                                                    ? '#C4483A'
                                                    : '#7E9AA0',
                                            marginTop: '4px',
                                        }}
                                    >
                                        {client.overdue > 0
                                            ? 'Follow up required'
                                            : 'Nothing past due'}
                                    </div>
                                </div>

                                {/* Credit limit */}
                                <div
                                    style={{
                                        background: '#F8FBFB',
                                        border: '1px solid #E0EBED',
                                        borderRadius: '10px',
                                        padding: '14px 16px',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: '10.5px',
                                            fontWeight: 500,
                                            letterSpacing: '0.06em',
                                            textTransform: 'uppercase',
                                            color: '#7E9AA0',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        Credit limit
                                    </div>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Bitter', Georgia, serif",
                                            fontWeight: 600,
                                            fontSize: '20px',
                                            color: '#123238',
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        {formatMoney(creditLimit)}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            color: '#7E9AA0',
                                            marginTop: '4px',
                                        }}
                                    >
                                        {client.payment_terms}
                                    </div>
                                </div>

                                {/* Available */}
                                <div
                                    style={{
                                        background: isOverLimit
                                            ? '#FBEAE7'
                                            : '#F8FBFB',
                                        border: `1px solid ${isOverLimit ? '#E8C1BC' : '#E0EBED'}`,
                                        borderRadius: '10px',
                                        padding: '14px 16px',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: '10.5px',
                                            fontWeight: 500,
                                            letterSpacing: '0.06em',
                                            textTransform: 'uppercase',
                                            color: '#7E9AA0',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        Available
                                    </div>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Bitter', Georgia, serif",
                                            fontWeight: 600,
                                            fontSize: '20px',
                                            color: isOverLimit
                                                ? '#C4483A'
                                                : '#1F5C3D',
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        {formatMoney(
                                            isOverLimit ? 0 : available,
                                        )}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            color: isOverLimit
                                                ? '#C4483A'
                                                : '#7E9AA0',
                                            marginTop: '4px',
                                        }}
                                    >
                                        {isOverLimit
                                            ? 'Over the limit'
                                            : 'Full credit available'}
                                    </div>
                                </div>
                            </div>

                            {/* Credit used bar */}
                            <div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '5px',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: '11px',
                                            color: '#7E9AA0',
                                        }}
                                    >
                                        Credit used
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '11px',
                                            color: '#7E9AA0',
                                        }}
                                    >
                                        {creditUsedPct.toFixed(0)}%
                                    </span>
                                </div>
                                <div
                                    style={{
                                        height: '6px',
                                        background: '#EFF5F6',
                                        borderRadius: '3px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            height: '100%',
                                            width: `${creditUsedPct}%`,
                                            background: barColor,
                                            borderRadius: '3px',
                                            transition: 'width 0.3s ease',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Trip history card */}
                    <section
                        ref={tripsCardRef}
                        style={{
                            background: '#FFFFFF',
                            border: '1px solid #E0EBED',
                            borderRadius: '14px',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                padding: '18px 20px 15px',
                                borderBottom: '1px solid #EFF5F6',
                            }}
                        >
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
                                Trip history
                            </h3>
                            <div
                                style={{ fontSize: '12.5px', color: '#5E7A80' }}
                            >
                                Most recent first · {trips.length} trips on
                                record
                            </div>
                        </div>

                        {/* Table header */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: tripGridCols,
                                gap: '10px',
                                alignItems: 'center',
                                padding: '9px 20px',
                                background: '#F8FBFB',
                                borderBottom: '1px solid #EFF5F6',
                            }}
                        >
                            <div style={thStyle}>Date</div>
                            <div style={thStyle}>Route</div>
                            {tripTier !== 'compact' && (
                                <div style={thStyle}>Truck · driver</div>
                            )}
                            {tripTier === 'full' && (
                                <div style={thStyle}>Line</div>
                            )}
                            {tripTier === 'full' && (
                                <div style={{ ...thStyle, textAlign: 'right' }}>
                                    Km
                                </div>
                            )}
                            <div style={thStyle}>Status</div>
                        </div>

                        {/* Trip rows */}
                        {trips.length === 0 ? (
                            <div
                                style={{
                                    padding: '40px 20px',
                                    textAlign: 'center',
                                    fontSize: '12.5px',
                                    color: '#5E7A80',
                                }}
                            >
                                No trips recorded for this client yet.
                            </div>
                        ) : (
                            trips.map((trip) => (
                                <ClientTripRow
                                    key={trip.id}
                                    trip={trip}
                                    tripGridCols={tripGridCols}
                                    tripTier={tripTier}
                                />
                            ))
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}

interface ClientTripRowProps {
    trip: TripRow;
    tripGridCols: string;
    tripTier: 'full' | 'mid' | 'compact';
}

function ClientTripRow({ trip, tripGridCols, tripTier }: ClientTripRowProps) {
    const [hoverRow, setHoverRow] = useState(false);
    const statusCfg = TRIP_STATUS_CFG[trip.status] ?? {
        bg: '#F2F4F5',
        fg: '#4A5568',
        dot: '#718096',
        ring: '#CBD5E0',
    };
    const isImport = trip.type === 'import';

    return (
        <div
            onMouseEnter={() => setHoverRow(true)}
            onMouseLeave={() => setHoverRow(false)}
            style={{
                display: 'grid',
                gridTemplateColumns: tripGridCols,
                gap: '10px',
                alignItems: 'center',
                padding: '10px 20px',
                borderBottom: '1px solid #F4F8F9',
                background: hoverRow ? '#F8FBFB' : '#FFFFFF',
            }}
        >
            {/* Date + type tag */}
            <div>
                <div
                    style={{
                        fontSize: '12.5px',
                        fontWeight: 500,
                        color: '#123238',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {formatDate(trip.date)}
                </div>
                <span
                    style={{
                        display: 'inline-block',
                        marginTop: '3px',
                        fontSize: '10px',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isImport ? '#E3F1F3' : '#EBF4F7',
                        color: isImport ? '#1a4e57' : '#4a909f',
                    }}
                >
                    {isImport ? 'Import' : 'Export'}
                </span>
            </div>

            {/* Route */}
            <div style={{ minWidth: 0 }}>
                <div
                    style={{
                        fontSize: '12.5px',
                        fontWeight: 500,
                        color: '#123238',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {trip.from_location} → {trip.to_location}
                </div>
            </div>

            {/* Truck · driver */}
            {tripTier !== 'compact' && (
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
                        {trip.truck_plate ?? '—'}
                        {trip.driver_name && (
                            <span style={{ color: '#7E9AA0' }}>
                                {' '}
                                · {trip.driver_name}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Line */}
            {tripTier === 'full' && (
                <div
                    style={{
                        fontSize: '12.5px',
                        color: '#3D5F66',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0,
                    }}
                >
                    {trip.line ?? '—'}
                </div>
            )}

            {/* Km */}
            {tripTier === 'full' && (
                <div
                    style={{
                        fontSize: '12.5px',
                        color: '#3D5F66',
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {trip.km.toLocaleString('en-US')}
                </div>
            )}

            {/* Status chip */}
            <div>
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11.5px',
                        fontWeight: 500,
                        padding: '3px 9px',
                        borderRadius: '20px',
                        border: `1px solid ${statusCfg.ring}`,
                        background: statusCfg.bg,
                        color: statusCfg.fg,
                        whiteSpace: 'nowrap',
                    }}
                >
                    <span
                        style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: statusCfg.dot,
                            flexShrink: 0,
                        }}
                    />
                    {trip.status}
                </span>
            </div>
        </div>
    );
}
