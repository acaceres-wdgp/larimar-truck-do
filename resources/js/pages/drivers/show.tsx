import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type DriverStatus = 'available' | 'on_trip' | 'on_leave' | 'inactive';

interface DriverData {
    id: number;
    first_name: string;
    last_name: string;
    national_id: string | null;
    phone: string | null;
    emergency_contact: string | null;
    license_number: string;
    license_category: string | null;
    license_expires_at: string | null;
    status: DriverStatus;
    notes: string | null;
    photo_path: string | null;
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
    driver: DriverData;
    trips: TripRow[];
    metrics: Metrics;
}

const DRIVER_STATUS_CFG: Record<
    DriverStatus,
    { label: string; bg: string; fg: string; dot: string; ring: string }
> = {
    available: {
        label: 'Available',
        bg: '#E6F4EC',
        fg: '#1F5C3D',
        dot: '#2E8055',
        ring: '#B8E0C4',
    },
    on_trip: {
        label: 'On trip',
        bg: '#EAF2FA',
        fg: '#2C4E72',
        dot: '#5B84B1',
        ring: '#B3CCE8',
    },
    on_leave: {
        label: 'On leave',
        bg: '#FBF2E1',
        fg: '#7A5210',
        dot: '#C68A1E',
        ring: '#E8D5A3',
    },
    inactive: {
        label: 'Inactive',
        bg: '#FBEAE7',
        fg: '#8A2A21',
        dot: '#C4483A',
        ring: '#E8C1BC',
    },
};

const TRIP_STATUS_CFG: Record<
    string,
    { bg: string; fg: string; ring: string }
> = {
    Completed: { bg: '#E6F4EC', fg: '#1F5C3D', ring: '#B8E0C4' },
    'On the road': { bg: '#EAF2FA', fg: '#2C4E72', ring: '#B3CCE8' },
    Scheduled: { bg: '#F2F4F5', fg: '#3D5F66', ring: '#D0DADE' },
    'At port': { bg: '#E3F1F3', fg: '#1a4e57', ring: '#B2D8DF' },
    Paused: { bg: '#FBF2E1', fg: '#7A5210', ring: '#E8D5A3' },
    Delayed: { bg: '#FBEAE7', fg: '#8A2A21', ring: '#E8C1BC' },
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

export default function DriverShow({ driver, trips, metrics }: PageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerW, setContainerW] = useState(1200);
    const tripsCardRef = useRef<HTMLDivElement>(null);
    const [tripsW, setTripsW] = useState(800);

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

    const twoCol = containerW >= 1080;
    const statusCfg = DRIVER_STATUS_CFG[driver.status];
    const initials = (
        driver.first_name.charAt(0) + driver.last_name.charAt(0)
    ).toUpperCase();
    const fullName = `${driver.first_name} ${driver.last_name}`;

    const tripTier =
        tripsW >= 1240 ? 'full' : tripsW >= 940 ? 'mid' : 'compact';
    const tripGridCols =
        tripTier === 'full'
            ? '104px minmax(0,1.4fr) 140px 108px 84px 132px'
            : tripTier === 'mid'
              ? '104px minmax(0,1.4fr) 140px 132px'
              : '96px minmax(0,1fr) 124px';

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
            <Head title={fullName} />

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
                            href="/drivers"
                            style={{ color: '#4a909f', textDecoration: 'none' }}
                        >
                            Drivers
                        </Link>{' '}
                        / {fullName}
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
                        {fullName}
                    </h2>
                </div>
                <div style={{ display: 'flex', gap: '9px' }}>
                    <button
                        onClick={() => router.get('/drivers')}
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
                        Back to crew
                    </button>
                    <button
                        onClick={() => router.get(`/drivers/${driver.id}/edit`)}
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
                        Edit driver
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
                {/* Left column: profile card + metrics */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                    }}
                >
                    {/* Profile card */}
                    <section
                        style={{
                            background: '#FFFFFF',
                            border: '1px solid #E0EBED',
                            borderRadius: '14px',
                            overflow: 'hidden',
                        }}
                    >
                        <div style={{ padding: '18px 18px 16px' }}>
                            {/* Circular avatar */}
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
                                        width: '132px',
                                        height: '132px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        background: '#E3F1F3',
                                        border: '1px solid #E0EBED',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '12px',
                                    }}
                                >
                                    {driver.photo_path ? (
                                        <img
                                            src={`/storage/${driver.photo_path}`}
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
                                                fontSize: '38px',
                                                color: '#1a4e57',
                                                lineHeight: 1,
                                            }}
                                        >
                                            {initials}
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
                                    }}
                                >
                                    {fullName}
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
                                        National ID
                                    </div>
                                    <div style={fieldValueStyle}>
                                        {driver.national_id ?? '—'}
                                    </div>
                                </div>
                                <div>
                                    <div style={fieldLabelStyle}>Phone</div>
                                    <div style={fieldValueStyle}>
                                        {driver.phone ?? '—'}
                                    </div>
                                </div>
                                <div>
                                    <div style={fieldLabelStyle}>
                                        Driver license
                                    </div>
                                    <div style={fieldValueStyle}>
                                        {driver.license_number}
                                    </div>
                                </div>
                                <div>
                                    <div style={fieldLabelStyle}>Category</div>
                                    <div style={fieldValueStyle}>
                                        {driver.license_category ?? '—'}
                                    </div>
                                </div>
                                <div>
                                    <div style={fieldLabelStyle}>
                                        License expires
                                    </div>
                                    <div style={fieldValueStyle}>
                                        {driver.license_expires_at
                                            ? formatDate(
                                                  driver.license_expires_at,
                                              )
                                            : '—'}
                                    </div>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={fieldLabelStyle}>
                                        Emergency contact
                                    </div>
                                    <div style={fieldValueStyle}>
                                        {driver.emergency_contact ?? '—'}
                                    </div>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={fieldLabelStyle}>Notes</div>
                                    <div
                                        style={{
                                            ...fieldValueStyle,
                                            fontSize: '12.5px',
                                            lineHeight: 1.5,
                                            color: driver.notes
                                                ? '#123238'
                                                : '#7E9AA0',
                                        }}
                                    >
                                        {driver.notes ?? 'No notes on file.'}
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

                {/* Right column: trip history */}
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
                        <div style={{ fontSize: '12.5px', color: '#5E7A80' }}>
                            Most recent first · {trips.length} trips on record
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
                        <div style={thStyle}>Client &amp; route</div>
                        {tripTier !== 'compact' && (
                            <div style={thStyle}>Truck</div>
                        )}
                        {tripTier === 'full' && <div style={thStyle}>Line</div>}
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
                            No trips recorded for this driver yet.
                        </div>
                    ) : (
                        trips.map((trip) => (
                            <DriverTripRow
                                key={trip.id}
                                trip={trip}
                                tripGridCols={tripGridCols}
                                tripTier={tripTier}
                            />
                        ))
                    )}
                </section>
            </div>
        </>
    );
}

interface DriverTripRowProps {
    trip: TripRow;
    tripGridCols: string;
    tripTier: 'full' | 'mid' | 'compact';
}

function DriverTripRow({ trip, tripGridCols, tripTier }: DriverTripRowProps) {
    const [hoverRow, setHoverRow] = useState(false);
    const statusCfg = TRIP_STATUS_CFG[trip.status] ?? {
        bg: '#F2F4F5',
        fg: '#3D5F66',
        ring: '#D0DADE',
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

            {/* Client & route */}
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
                    {trip.client}
                </div>
                <div
                    style={{
                        fontSize: '11px',
                        color: '#5E7A80',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {trip.from_location} → {trip.to_location}
                </div>
            </div>

            {/* Truck */}
            {tripTier !== 'compact' && (
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
                    {trip.truck_plate ?? '—'}
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
                    {trip.status}
                </span>
            </div>
        </div>
    );
}
