import { Head, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type DriverStatus = 'available' | 'on_trip' | 'on_leave' | 'inactive';

interface DriverRow {
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

interface PageProps {
    drivers: DriverRow[];
}

const STATUS_CFG: Record<
    DriverStatus,
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
    on_leave: {
        label: 'De licencia',
        bg: '#FBF2E1',
        fg: '#7A5210',
        dot: '#C68A1E',
        ring: '#E8D5A3',
    },
    inactive: {
        label: 'Inactivo',
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
    { key: 'on_leave', label: 'De licencia' },
    { key: 'inactive', label: 'Inactivo' },
];

function expiringLicenseCount(drivers: DriverRow[]): number {
    const now = new Date();
    const limit = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const limitStr = limit.toISOString().slice(0, 10);
    const todayStr = now.toISOString().slice(0, 10);
    return drivers.filter((d) => {
        const exp = d.license_expires_at;
        return exp && exp >= todayStr && exp <= limitStr;
    }).length;
}

export default function DriversIndex({ drivers }: PageProps) {
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

    const filtered = drivers.filter((d) => {
        const matchStatus = statusFilter === 'all' || d.status === statusFilter;
        if (!matchStatus) return false;
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
            d.first_name.toLowerCase().includes(q) ||
            d.last_name.toLowerCase().includes(q) ||
            (d.phone?.toLowerCase() ?? '').includes(q) ||
            d.license_number.toLowerCase().includes(q)
        );
    });

    const totalCount = drivers.length;
    const availableCount = drivers.filter(
        (d) => d.status === 'available',
    ).length;
    const onTripCount = drivers.filter((d) => d.status === 'on_trip').length;
    const expiringCount = expiringLicenseCount(drivers);

    const tier =
        containerW >= 1260 ? 'full' : containerW >= 1000 ? 'mid' : 'compact';

    const gridCols =
        tier === 'full'
            ? '44px minmax(0,1.2fr) 150px 158px 132px 104px'
            : tier === 'mid'
              ? '44px minmax(0,1.2fr) 150px minmax(0,1fr) 132px 104px'
              : 'minmax(0,1fr) 124px 100px';

    const showPhoto = tier !== 'compact';
    const showPhone = tier !== 'compact';
    const showLicense = tier !== 'compact';

    function handleDelete(driver: DriverRow) {
        router.delete(`/drivers/${driver.id}`);
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
            <Head title="Choferes" />

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
                        Inicio / Choferes
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
                        Choferes
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
                        onClick={() => router.get('/drivers/create')}
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
                        Nuevo chofer
                    </button>
                </div>
            </div>

            {/* Crew card */}
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
                            Choferes
                        </h3>
                        <div style={{ fontSize: '12.5px', color: '#5E7A80' }}>
                            {totalCount} choferes · {availableCount} disponibles ·{' '}
                            {onTripCount} en ruta
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
                                placeholder="Nombre, teléfono, licencia…"
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
                    {showPhoto && <div style={thStyle}>Foto</div>}
                    <div style={thStyle}>Nombre</div>
                    {showPhone && <div style={thStyle}>Teléfono</div>}
                    {showLicense && <div style={thStyle}>Licencia</div>}
                    <div style={thStyle}>Estado</div>
                    <div style={{ ...thStyle, textAlign: 'right' }}>
                        Acciones
                    </div>
                </div>

                {/* Rows */}
                {filtered.map((driver) => (
                    <DriverRowItem
                        key={driver.id}
                        driver={driver}
                        cfg={STATUS_CFG[driver.status]}
                        gridCols={gridCols}
                        showPhoto={showPhoto}
                        showPhone={showPhone}
                        showLicense={showLicense}
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
                        Ningún chofer coincide con este filtro.
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
                        Mostrando {filtered.length} de {totalCount} choferes
                    </span>
                    <span
                        style={{
                            marginLeft: 'auto',
                            fontSize: '11.5px',
                            color: '#5E7A80',
                        }}
                    >
                        {expiringCount} con licencia por vencer en 60 días
                    </span>
                </div>
            </section>
        </>
    );
}

interface DriverRowProps {
    driver: DriverRow;
    cfg: { label: string; bg: string; fg: string; dot: string; ring: string };
    gridCols: string;
    showPhoto: boolean;
    showPhone: boolean;
    showLicense: boolean;
    onDelete: (driver: DriverRow) => void;
}

function DriverRowItem({
    driver,
    cfg,
    gridCols,
    showPhoto,
    showPhone,
    showLicense,
    onDelete,
}: DriverRowProps) {
    const [hoverView, setHoverView] = useState(false);
    const [hoverEdit, setHoverEdit] = useState(false);
    const [hoverDelete, setHoverDelete] = useState(false);
    const [hoverRow, setHoverRow] = useState(false);

    const initials = (
        driver.first_name.charAt(0) + driver.last_name.charAt(0)
    ).toUpperCase();

    // License expiry warning: red if < 60 days
    const now = new Date();
    const limit = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const limitStr = limit.toISOString().slice(0, 10);
    const todayStr = now.toISOString().slice(0, 10);
    const licenseExpiring =
        driver.license_expires_at &&
        driver.license_expires_at >= todayStr &&
        driver.license_expires_at <= limitStr;

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
            {/* Avatar */}
            {showPhoto && (
                <div
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: '#E3F1F3',
                        border: '1px solid #E0EBED',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
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
                                fontFamily: "'Bitter', Georgia, serif",
                                fontWeight: 600,
                                fontSize: '12px',
                                color: '#1a4e57',
                                lineHeight: 1,
                            }}
                        >
                            {initials}
                        </span>
                    )}
                </div>
            )}

            {/* Name */}
            <div style={{ minWidth: 0 }}>
                <div
                    style={{
                        fontSize: '13.5px',
                        fontWeight: 500,
                        color: '#123238',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {driver.first_name} {driver.last_name}
                </div>
            </div>

            {/* Phone */}
            {showPhone && (
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
                    {driver.phone ?? '—'}
                </div>
            )}

            {/* License */}
            {showLicense && (
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
                        {driver.license_number}
                    </div>
                    {driver.license_expires_at && (
                        <div
                            style={{
                                fontSize: '11px',
                                color: licenseExpiring ? '#B14C3C' : '#7E9AA0',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Vence {formatDate(driver.license_expires_at)}
                        </div>
                    )}
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
                    onClick={() => router.get(`/drivers/${driver.id}`)}
                    onMouseEnter={() => setHoverView(true)}
                    onMouseLeave={() => setHoverView(false)}
                    title="Ver chofer"
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
                    onClick={() => router.get(`/drivers/${driver.id}/edit`)}
                    onMouseEnter={() => setHoverEdit(true)}
                    onMouseLeave={() => setHoverEdit(false)}
                    title="Editar chofer"
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
                    onClick={() => onDelete(driver)}
                    onMouseEnter={() => setHoverDelete(true)}
                    onMouseLeave={() => setHoverDelete(false)}
                    title="Eliminar chofer"
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
