import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type TruckStatus =
    | 'available'
    | 'on_trip'
    | 'in_maintenance'
    | 'out_of_service';
type TripStatus =
    | 'Completed'
    | 'On the road'
    | 'Scheduled'
    | 'At port'
    | 'Paused'
    | 'Delayed';

interface TruckData {
    id: number;
    plate: string;
    vin: string | null;
    make: string;
    model: string | null;
    year: number | null;
    type: string | null;
    capacity_tons: number | null;
    odometer_km: number | null;
    status: TruckStatus;
    insurance_expires_at: string | null;
    inspection_expires_at: string | null;
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
    truck: TruckData;
    trips: TripRow[];
    metrics: Metrics;
}

const TRUCK_STATUS_CFG: Record<
    TruckStatus,
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
    in_maintenance: {
        label: 'In maintenance',
        bg: '#FBF2E1',
        fg: '#7A5210',
        dot: '#C68A1E',
        ring: '#E8D5A3',
    },
    out_of_service: {
        label: 'Out of service',
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

function formatOdo(n: number | null): string {
    if (n === null) return '—';
    return n.toLocaleString('en-US') + ' km';
}

export default function TruckShow({ truck, trips, metrics }: PageProps) {
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
    const statusCfg = TRUCK_STATUS_CFG[truck.status];

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
            <Head
                title={`${truck.plate} · ${truck.make} ${truck.model ?? ''}`}
            />

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
                            href="/trucks"
                            style={{ color: '#4a909f', textDecoration: 'none' }}
                        >
                            Trucks
                        </Link>{' '}
                        / {truck.plate}
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
                        {truck.plate} · {truck.make} {truck.model}
                    </h2>
                </div>
                <div style={{ display: 'flex', gap: '9px' }}>
                    <button
                        onClick={() => router.get('/trucks')}
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
                        Back to fleet
                    </button>
                    <button
                        onClick={() => router.get(`/trucks/${truck.id}/edit`)}
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
                        Edit truck
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
                            {/* Truck photo */}
                            <div
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    borderRadius: '9px',
                                    overflow: 'hidden',
                                    background: '#EDF3F4',
                                    border: '1px solid #E0EBED',
                                    marginBottom: '12px',
                                }}
                            >
                                <img
                                    src={
                                        truck.photo_path
                                            ? `/storage/${truck.photo_path}`
                                            : '/images/truck-placeholder.png'
                                    }
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
                            </div>

                            {/* Status chip */}
                            <div style={{ marginBottom: '16px' }}>
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
                                    <div style={fieldLabelStyle}>Plate</div>
                                    <div style={fieldValueStyle}>
                                        {truck.plate}
                                    </div>
                                </div>
                                <div>
                                    <div style={fieldLabelStyle}>
                                        VIN / Chassis
                                    </div>
                                    <div
                                        style={{
                                            ...fieldValueStyle,
                                            fontSize: '12px',
                                            wordBreak: 'break-all',
                                        }}
                                    >
                                        {truck.vin ?? '—'}
                                    </div>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={fieldLabelStyle}>
                                        Make &amp; model
                                    </div>
                                    <div style={fieldValueStyle}>
                                        {truck.make} {truck.model ?? ''}
                                    </div>
                                </div>
                                <div>
                                    <div style={fieldLabelStyle}>Year</div>
                                    <div style={fieldValueStyle}>
                                        {truck.year ?? '—'}
                                    </div>
                                </div>
                                <div>
                                    <div style={fieldLabelStyle}>Body type</div>
                                    <div style={fieldValueStyle}>
                                        {truck.type ?? '—'}
                                    </div>
                                </div>
                                <div>
                                    <div style={fieldLabelStyle}>Capacity</div>
                                    <div style={fieldValueStyle}>
                                        {truck.capacity_tons != null
                                            ? `${truck.capacity_tons} t`
                                            : '—'}
                                    </div>
                                </div>
                                <div>
                                    <div style={fieldLabelStyle}>Odometer</div>
                                    <div style={fieldValueStyle}>
                                        {formatOdo(truck.odometer_km)}
                                    </div>
                                </div>
                                <div>
                                    <div style={fieldLabelStyle}>
                                        Insurance expires
                                    </div>
                                    <div style={fieldValueStyle}>
                                        {truck.insurance_expires_at
                                            ? formatDate(
                                                  truck.insurance_expires_at,
                                              )
                                            : '—'}
                                    </div>
                                </div>
                                <div>
                                    <div style={fieldLabelStyle}>
                                        Inspection expires
                                    </div>
                                    <div style={fieldValueStyle}>
                                        {truck.inspection_expires_at
                                            ? formatDate(
                                                  truck.inspection_expires_at,
                                              )
                                            : '—'}
                                    </div>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={fieldLabelStyle}>Notes</div>
                                    <div
                                        style={{
                                            ...fieldValueStyle,
                                            fontSize: '12.5px',
                                            lineHeight: 1.5,
                                            color: truck.notes
                                                ? '#123238'
                                                : '#7E9AA0',
                                        }}
                                    >
                                        {truck.notes ?? 'No notes on file.'}
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
                            <div style={thStyle}>Driver</div>
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
                            No trips recorded for this truck yet.
                        </div>
                    ) : (
                        trips.map((trip) => (
                            <TripRowItem
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

interface TripRowItemProps {
    trip: TripRow;
    tripGridCols: string;
    tripTier: 'full' | 'mid' | 'compact';
}

function TripRowItem({ trip, tripGridCols, tripTier }: TripRowItemProps) {
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

            {/* Driver */}
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
                    {trip.driver_name ?? '—'}
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
