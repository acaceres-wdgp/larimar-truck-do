import { Head, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type TruckStatus =
    | 'available'
    | 'on_trip'
    | 'in_maintenance'
    | 'out_of_service';

interface TruckRow {
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
    photo_path: string | null;
}

interface PageProps {
    trucks: TruckRow[];
}

const STATUS_CFG: Record<
    TruckStatus,
    { label: string; bg: string; fg: string; dot: string; ring: string }
> = {
    available: {
        label: 'Disponible',
        bg: '#E6F4EC',
        fg: '#1F5C3D',
        dot: '#2E8055',
        ring: '#B8E0C4',
    },
    on_trip: {
        label: 'En viaje',
        bg: '#EAF2FA',
        fg: '#2C4E72',
        dot: '#5B84B1',
        ring: '#B3CCE8',
    },
    in_maintenance: {
        label: 'En mantenimiento',
        bg: '#FBF2E1',
        fg: '#7A5210',
        dot: '#C68A1E',
        ring: '#E8D5A3',
    },
    out_of_service: {
        label: 'Fuera de servicio',
        bg: '#FBEAE7',
        fg: '#8A2A21',
        dot: '#C4483A',
        ring: '#E8C1BC',
    },
};

const STATUS_TABS: { key: string; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'available', label: 'Disponible' },
    { key: 'on_trip', label: 'En viaje' },
    { key: 'in_maintenance', label: 'En mantenimiento' },
    { key: 'out_of_service', label: 'Fuera de servicio' },
];

function dueSoonCount(trucks: TruckRow[]): number {
    const now = new Date();
    const limit = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const limitStr = limit.toISOString().slice(0, 10);
    const todayStr = now.toISOString().slice(0, 10);
    return trucks.filter((t) => {
        const ins = t.insurance_expires_at;
        const insp = t.inspection_expires_at;
        return (
            (ins && ins >= todayStr && ins <= limitStr) ||
            (insp && insp >= todayStr && insp <= limitStr)
        );
    }).length;
}

function formatOdo(n: number | null): string {
    if (n === null) return '';
    return n.toLocaleString('en-US') + ' km';
}

export default function TrucksIndex({ trucks }: PageProps) {
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

    const filtered = trucks.filter((t) => {
        const matchStatus = statusFilter === 'all' || t.status === statusFilter;
        if (!matchStatus) return false;
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
            t.plate.toLowerCase().includes(q) ||
            (t.make?.toLowerCase() ?? '').includes(q) ||
            (t.model?.toLowerCase() ?? '').includes(q) ||
            (t.type?.toLowerCase() ?? '').includes(q)
        );
    });

    const totalCount = trucks.length;
    const availableCount = trucks.filter(
        (t) => t.status === 'available',
    ).length;
    const maintenanceCount = trucks.filter(
        (t) => t.status === 'in_maintenance',
    ).length;
    const dueSoon = dueSoonCount(trucks);

    // Responsive column tiers based on container width
    const tier =
        containerW >= 1260 ? 'full' : containerW >= 1000 ? 'mid' : 'compact';

    const gridCols =
        tier === 'full'
            ? '64px 130px minmax(0,1.25fr) 116px 92px 136px 104px'
            : tier === 'mid'
              ? '64px 130px minmax(0,1.25fr) 136px 104px'
              : '118px minmax(0,1fr) 122px 100px';

    const showImage = tier !== 'compact';
    const showType = tier === 'full';
    const showCapacity = tier === 'full';

    function handleDelete(truck: TruckRow) {
        router.delete(`/trucks/${truck.id}`);
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
            <Head title="Camiones" />

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
                        Inicio / Camiones
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
                        Flota
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
                        onClick={() => router.get('/trucks/create')}
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
                        Nuevo camión
                    </button>
                </div>
            </div>

            {/* Fleet card */}
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
                            Camiones
                        </h3>
                        <div style={{ fontSize: '12.5px', color: '#5E7A80' }}>
                            {totalCount} camiones · {availableCount} disponibles ·{' '}
                            {maintenanceCount} en mantenimiento
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
                                placeholder="Placa, marca, tipo…"
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
                    {showImage && <div style={thStyle}>Imagen</div>}
                    <div style={thStyle}>Placa</div>
                    <div style={thStyle}>Marca &amp; modelo</div>
                    {showType && <div style={thStyle}>Tipo</div>}
                    {showCapacity && <div style={thStyle}>Capacidad</div>}
                    <div style={thStyle}>Estado</div>
                    <div style={{ ...thStyle, textAlign: 'right' }}>
                        Acciones
                    </div>
                </div>

                {/* Rows */}
                {filtered.map((truck) => {
                    const cfg = STATUS_CFG[truck.status];
                    return (
                        <TruckRowItem
                            key={truck.id}
                            truck={truck}
                            cfg={cfg}
                            gridCols={gridCols}
                            showImage={showImage}
                            showType={showType}
                            showCapacity={showCapacity}
                            onDelete={handleDelete}
                        />
                    );
                })}

                {/* Empty state */}
                {filtered.length === 0 && (
                    <div
                        style={{
                            padding: '40px 20px',
                            textAlign: 'center',
                            fontSize: '12.5px',
                            color: '#5E7A80',
                        }}
                    >
                        Ningún camión coincide con este filtro.
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
                        Mostrando {filtered.length} de {totalCount} camiones
                    </span>
                    <span
                        style={{
                            marginLeft: 'auto',
                            fontSize: '11.5px',
                            color: '#5E7A80',
                        }}
                    >
                        {dueSoon} con seguro o inspección por vencer en 30 días
                    </span>
                </div>
            </section>
        </>
    );
}

interface TruckRowProps {
    truck: TruckRow;
    cfg: { label: string; bg: string; fg: string; dot: string; ring: string };
    gridCols: string;
    showImage: boolean;
    showType: boolean;
    showCapacity: boolean;
    onDelete: (truck: TruckRow) => void;
}

function TruckRowItem({
    truck,
    cfg,
    gridCols,
    showImage,
    showType,
    showCapacity,
    onDelete,
}: TruckRowProps) {
    const [hoverView, setHoverView] = useState(false);
    const [hoverEdit, setHoverEdit] = useState(false);
    const [hoverDelete, setHoverDelete] = useState(false);
    const [hoverRow, setHoverRow] = useState(false);

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
            {/* Image */}
            {showImage && (
                <div
                    style={{
                        width: '64px',
                        height: '46px',
                        borderRadius: '9px',
                        overflow: 'hidden',
                        background: '#EDF3F4',
                        border: '1px solid #E0EBED',
                        position: 'relative',
                        flexShrink: 0,
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
            )}

            {/* Plate + VIN */}
            <div style={{ minWidth: 0 }}>
                <div
                    style={{
                        fontSize: '13.5px',
                        fontWeight: 500,
                        color: '#123238',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {truck.plate}
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
                    {truck.vin ?? ''}
                </div>
            </div>

            {/* Make & Model */}
            <div style={{ minWidth: 0 }}>
                <div
                    style={{
                        fontSize: '13.5px',
                        color: '#123238',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {truck.make} {truck.model}
                </div>
                <div
                    style={{
                        fontSize: '11.5px',
                        color: '#5E7A80',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {[
                        truck.year,
                        truck.odometer_km != null
                            ? formatOdo(truck.odometer_km)
                            : null,
                    ]
                        .filter(Boolean)
                        .join(' · ')}
                </div>
            </div>

            {/* Type */}
            {showType && (
                <div
                    style={{
                        minWidth: 0,
                        fontSize: '12.5px',
                        color: '#3D5F66',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {truck.type ?? '—'}
                </div>
            )}

            {/* Capacity */}
            {showCapacity && (
                <div
                    style={{
                        minWidth: 0,
                        fontSize: '12.5px',
                        color: '#3D5F66',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {truck.capacity_tons != null
                        ? `${truck.capacity_tons} t`
                        : '—'}
                </div>
            )}

            {/* Status chip */}
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
                    onClick={() => router.get(`/trucks/${truck.id}`)}
                    onMouseEnter={() => setHoverView(true)}
                    onMouseLeave={() => setHoverView(false)}
                    title="Ver camión"
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
                    onClick={() => router.get(`/trucks/${truck.id}/edit`)}
                    onMouseEnter={() => setHoverEdit(true)}
                    onMouseLeave={() => setHoverEdit(false)}
                    title="Editar camión"
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
                    onClick={() => onDelete(truck)}
                    onMouseEnter={() => setHoverDelete(true)}
                    onMouseLeave={() => setHoverDelete(false)}
                    title="Eliminar camión"
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
