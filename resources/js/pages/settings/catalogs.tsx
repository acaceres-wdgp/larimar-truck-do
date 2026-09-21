import { Head, router } from '@inertiajs/react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import SettingsLayout from '@/layouts/settings-layout';
import { useEffect, useRef, useState } from 'react';

interface CatalogLine {
    id: number;
    name: string;
    scac: string | null;
    contact: string | null;
    active: boolean;
    trips_count: number;
}

interface CatalogCity {
    id: number;
    name: string;
    province: string | null;
    km_from_base: number;
    active: boolean;
    trips_count: number;
}

interface CatalogPort {
    id: number;
    name: string;
    code: string | null;
    km_from_base: number;
    active: boolean;
    trips_count: number;
}

interface PageProps {
    lines: CatalogLine[];
    cities: CatalogCity[];
    ports: CatalogPort[];
    initialTab: string;
}

type TabKey = 'Navieras' | 'Ciudades' | 'Puertos';

interface TabCfg {
    key: string;
    add: string;
    col1: string;
    col2: string;
    col3: string;
    ph1: string;
    ph2: string;
    ph3: string;
    storeUrl: string;
    updateUrl: (id: number) => string;
    deleteUrl: (id: number) => string;
    toggleUrl: (id: number) => string;
    subtitle: string;
    field2key: string;
    field3key: string;
}

const TAB_CFG: Record<TabKey, TabCfg> = {
    Navieras: {
        key: 'lines',
        add: 'Agregar naviera',
        col1: 'Naviera',
        col2: 'SCAC',
        col3: 'Contacto',
        ph1: 'Maersk',
        ph2: 'MAEU',
        ph3: '+1 809 000 0000 · ops@line.com',
        storeUrl: '/settings/catalogs/lines',
        updateUrl: (id) => `/settings/catalogs/lines/${id}`,
        deleteUrl: (id) => `/settings/catalogs/lines/${id}`,
        toggleUrl: (id) => `/settings/catalogs/lines/${id}/toggle`,
        subtitle:
            'Líneas con las que reservas contenedores. Se usan en el tablero de viajes.',
        field2key: 'scac',
        field3key: 'contact',
    },
    Ciudades: {
        key: 'cities',
        add: 'Agregar ciudad',
        col1: 'Ciudad',
        col2: 'Provincia',
        col3: 'Km desde base',
        ph1: 'La Vega',
        ph2: 'La Vega',
        ph3: '75',
        storeUrl: '/settings/catalogs/cities',
        updateUrl: (id) => `/settings/catalogs/cities/${id}`,
        deleteUrl: (id) => `/settings/catalogs/cities/${id}`,
        toggleUrl: (id) => `/settings/catalogs/cities/${id}/toggle`,
        subtitle:
            'Puntos de recogida y entrega en tierra. Distancia medida desde tu base en Santiago.',
        field2key: 'province',
        field3key: 'km_from_base',
    },
    Puertos: {
        key: 'ports',
        add: 'Agregar puerto',
        col1: 'Puerto',
        col2: 'Código',
        col3: 'Km desde base',
        ph1: 'Caucedo',
        ph2: 'DOCAU',
        ph3: '214',
        storeUrl: '/settings/catalogs/ports',
        updateUrl: (id) => `/settings/catalogs/ports/${id}`,
        deleteUrl: (id) => `/settings/catalogs/ports/${id}`,
        toggleUrl: (id) => `/settings/catalogs/ports/${id}/toggle`,
        subtitle:
            'Terminales marítimas de carga y descarga. Independiente de la lista de ciudades.',
        field2key: 'code',
        field3key: 'km_from_base',
    },
};

function getRowField2(
    row: CatalogLine | CatalogCity | CatalogPort,
    tab: TabKey,
): string {
    if (tab === 'Navieras') return (row as CatalogLine).scac ?? '';
    if (tab === 'Ciudades') return (row as CatalogCity).province ?? '';
    return (row as CatalogPort).code ?? '';
}

function getRowField3(
    row: CatalogLine | CatalogCity | CatalogPort,
    tab: TabKey,
): string {
    if (tab === 'Navieras') return (row as CatalogLine).contact ?? '';
    if (tab === 'Ciudades') return String((row as CatalogCity).km_from_base);
    return String((row as CatalogPort).km_from_base);
}

export default function Catalogs({
    lines,
    cities,
    ports,
    initialTab,
}: PageProps) {
    const [tab, setTab] = useState<TabKey>(
        (initialTab as TabKey) || 'Navieras',
    );
    const [editingId, setEditingId] = useState<number | 'new' | null>(null);
    const [draft, setDraft] = useState({ a: '', b: '', c: '' });
    const [error, setError] = useState('');

    const sectionRef = useRef<HTMLDivElement>(null);
    const [sectionW, setSectionW] = useState(1200);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const e = entries[0];
            if (e) setSectionW(e.contentRect.width);
        });
        ro.observe(el);
        setSectionW(el.getBoundingClientRect().width);
        return () => ro.disconnect();
    }, []);

    const cfg = TAB_CFG[tab];
    const rows: (CatalogLine | CatalogCity | CatalogPort)[] =
        tab === 'Navieras' ? lines : tab === 'Ciudades' ? cities : ports;

    // Responsive grid
    const wideLayout = sectionW >= 1180;
    const midLayout = sectionW >= 900;

    let gridCols: string;
    if (wideLayout) {
        gridCols = 'minmax(0,1.3fr) 110px minmax(0,1.1fr) 88px 112px 96px';
    } else if (midLayout) {
        gridCols = 'minmax(0,1.3fr) 110px 88px 112px 96px';
    } else {
        gridCols = 'minmax(0,1fr) 112px 96px';
    }

    function startEdit(row: CatalogLine | CatalogCity | CatalogPort) {
        setEditingId(row.id);
        setDraft({
            a: row.name,
            b: getRowField2(row, tab),
            c: getRowField3(row, tab),
        });
        setError('');
    }

    function startNew() {
        setEditingId('new');
        setDraft({ a: '', b: '', c: '' });
        setError('');
    }

    function cancelEdit() {
        setEditingId(null);
        setDraft({ a: '', b: '', c: '' });
        setError('');
    }

    function saveNew() {
        if (!draft.a.trim()) {
            setError('El nombre es obligatorio.');
            return;
        }
        const dup = rows.find(
            (r) => r.name.toLowerCase() === draft.a.trim().toLowerCase(),
        );
        if (dup) {
            setError(`"${draft.a.trim()}" ya existe en esta lista.`);
            return;
        }
        setError('');
        router.post(
            cfg.storeUrl,
            {
                name: draft.a.trim(),
                [cfg.field2key]: draft.b || null,
                [cfg.field3key]: draft.c || null,
            },
            { preserveScroll: true },
        );
        setEditingId(null);
    }

    function saveEdit(id: number) {
        if (!draft.a.trim()) {
            setError('El nombre es obligatorio.');
            return;
        }
        const dup = rows.find(
            (r) =>
                r.name.toLowerCase() === draft.a.trim().toLowerCase() &&
                r.id !== id,
        );
        if (dup) {
            setError(`"${draft.a.trim()}" ya existe en esta lista.`);
            return;
        }
        setError('');
        router.patch(
            cfg.updateUrl(id),
            {
                name: draft.a.trim(),
                [cfg.field2key]: draft.b || null,
                [cfg.field3key]: draft.c || null,
            },
            { preserveScroll: true },
        );
        setEditingId(null);
    }

    function handleToggle(id: number) {
        router.patch(cfg.toggleUrl(id), {}, { preserveScroll: true });
    }

    function handleDelete(id: number) {
        router.delete(cfg.deleteUrl(id), { preserveScroll: true });
    }

    const inputSt: React.CSSProperties = {
        border: '1px solid #4a909f',
        background: '#FFFFFF',
        borderRadius: '7px',
        padding: '6px 9px',
        fontSize: '12.5px',
        color: '#123238',
        outline: 'none',
        fontFamily: 'inherit',
        width: '100%',
        boxSizing: 'border-box',
    };

    const TAB_KEYS: TabKey[] = ['Navieras', 'Ciudades', 'Puertos'];

    return (
        <>
            <Head title="Configuración – Catálogos" />
            <SettingsLayout ctaLabel={cfg.add} onCta={startNew}>
                {/* Main card */}
                <div
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
                            padding: '18px 24px 0',
                            borderBottom: '1px solid #EFF5F6',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '12px',
                                marginBottom: '14px',
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontSize: '15px',
                                        fontWeight: 600,
                                        color: '#123238',
                                    }}
                                >
                                    {tab}
                                </div>
                                <div
                                    style={{
                                        fontSize: '12.5px',
                                        color: '#5E7A80',
                                        marginTop: '3px',
                                    }}
                                >
                                    {cfg.subtitle}
                                </div>
                            </div>
                            {/* Tab switcher */}
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {TAB_KEYS.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => {
                                            setTab(t);
                                            setEditingId(null);
                                            setError('');
                                        }}
                                        style={{
                                            padding: '6px 14px',
                                            background:
                                                tab === t
                                                    ? '#E3F1F3'
                                                    : 'transparent',
                                            border:
                                                tab === t
                                                    ? '1px solid #4a909f'
                                                    : '1px solid transparent',
                                            borderRadius: '7px',
                                            fontSize: '12.5px',
                                            fontWeight: tab === t ? 600 : 400,
                                            color:
                                                tab === t
                                                    ? '#1a4e57'
                                                    : '#5E7A80',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Column headers */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: gridCols,
                                gap: '0 12px',
                                padding: '0 0 8px',
                                alignItems: 'center',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: '#7E9AA0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                }}
                            >
                                {cfg.col1}
                            </div>
                            {midLayout && (
                                <div
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: '#7E9AA0',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                    }}
                                >
                                    {cfg.col2}
                                </div>
                            )}
                            {wideLayout && (
                                <div
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: '#7E9AA0',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                    }}
                                >
                                    {cfg.col3}
                                </div>
                            )}
                            {midLayout && (
                                <div
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: '#7E9AA0',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        textAlign: 'right',
                                    }}
                                >
                                    Uso
                                </div>
                            )}
                            <div
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: '#7E9AA0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                }}
                            >
                                Estado
                            </div>
                            <div
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: '#7E9AA0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    textAlign: 'right',
                                }}
                            >
                                Acciones
                            </div>
                        </div>
                    </div>

                    {/* Rows */}
                    <div ref={sectionRef}>
                        {rows.map((row) => {
                            const isEditing = editingId === row.id;
                            const f2 = getRowField2(row, tab);
                            const f3 = getRowField3(row, tab);
                            const tripsUsed = row.trips_count;

                            if (isEditing) {
                                return (
                                    <div
                                        key={row.id}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: gridCols,
                                            gap: '0 12px',
                                            padding: '10px 24px',
                                            alignItems: 'center',
                                            background: '#F8FBFB',
                                            borderTop: '1px solid #EFF5F6',
                                        }}
                                    >
                                        <input
                                            style={inputSt}
                                            value={draft.a}
                                            placeholder={cfg.ph1}
                                            onChange={(e) =>
                                                setDraft((d) => ({
                                                    ...d,
                                                    a: e.target.value,
                                                }))
                                            }
                                            autoFocus
                                        />
                                        {midLayout && (
                                            <input
                                                style={inputSt}
                                                value={draft.b}
                                                placeholder={cfg.ph2}
                                                onChange={(e) =>
                                                    setDraft((d) => ({
                                                        ...d,
                                                        b: e.target.value,
                                                    }))
                                                }
                                            />
                                        )}
                                        {wideLayout && (
                                            <input
                                                style={inputSt}
                                                value={draft.c}
                                                placeholder={cfg.ph3}
                                                onChange={(e) =>
                                                    setDraft((d) => ({
                                                        ...d,
                                                        c: e.target.value,
                                                    }))
                                                }
                                            />
                                        )}
                                        {midLayout && <div />}
                                        <div />
                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: '6px',
                                                justifyContent: 'flex-end',
                                            }}
                                        >
                                            <button
                                                onClick={() => saveEdit(row.id)}
                                                title="Guardar"
                                                style={{
                                                    width: '30px',
                                                    height: '30px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: '#1a4e57',
                                                    border: 'none',
                                                    borderRadius: '7px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <Check
                                                    size={14}
                                                    color="#FFFFFF"
                                                />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                title="Cancelar"
                                                style={{
                                                    width: '30px',
                                                    height: '30px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: 'transparent',
                                                    border: '1px solid #DCE8EA',
                                                    borderRadius: '7px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <X size={14} color="#5E7A80" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={row.id}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: gridCols,
                                        gap: '0 12px',
                                        padding: '11px 24px',
                                        alignItems: 'center',
                                        borderTop: '1px solid #EFF5F6',
                                    }}
                                >
                                    {/* col1: name */}
                                    <div
                                        style={{
                                            fontSize: '13.5px',
                                            fontWeight: 500,
                                            color: '#123238',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {row.name}
                                    </div>
                                    {/* col2 */}
                                    {midLayout && (
                                        <div
                                            style={{
                                                fontSize: '12.5px',
                                                color: '#5E7A80',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {f2 || '—'}
                                        </div>
                                    )}
                                    {/* col3 */}
                                    {wideLayout && (
                                        <div
                                            style={{
                                                fontSize: '12.5px',
                                                color: '#5E7A80',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {f3 || '—'}
                                        </div>
                                    )}
                                    {/* Usage */}
                                    {midLayout && (
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#5E7A80',
                                                textAlign: 'right',
                                            }}
                                        >
                                            {tripsUsed > 0
                                                ? `${tripsUsed} viajes`
                                                : '—'}
                                        </div>
                                    )}
                                    {/* Status chip */}
                                    <div>
                                        <button
                                            onClick={() => handleToggle(row.id)}
                                            title="Activar/desactivar"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                padding: '3px 9px',
                                                borderRadius: '20px',
                                                border: `1px solid ${row.active ? '#B8E0C4' : '#C6D1D3'}`,
                                                background: row.active
                                                    ? '#E6F4EC'
                                                    : '#E9EFF0',
                                                cursor: 'pointer',
                                                fontSize: '11.5px',
                                                fontWeight: 500,
                                                color: row.active
                                                    ? '#1F5C3D'
                                                    : '#40595E',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    background: row.active
                                                        ? '#2E8055'
                                                        : '#8AA4A9',
                                                    flexShrink: 0,
                                                }}
                                            />
                                            {row.active ? 'Activo' : 'Inactivo'}
                                        </button>
                                    </div>
                                    {/* Actions */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '6px',
                                            justifyContent: 'flex-end',
                                        }}
                                    >
                                        <button
                                            onClick={() => startEdit(row)}
                                            title="Editar"
                                            style={{
                                                width: '30px',
                                                height: '30px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'transparent',
                                                border: '1px solid #DCE8EA',
                                                borderRadius: '7px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Pencil size={13} color="#5E7A80" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(row.id)}
                                            title={
                                                tripsUsed > 0
                                                    ? 'Usado en viajes — desactívalo en su lugar'
                                                    : 'Eliminar'
                                            }
                                            style={{
                                                width: '30px',
                                                height: '30px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'transparent',
                                                border: `1px solid ${tripsUsed > 0 ? '#EDF3F4' : '#DCE8EA'}`,
                                                borderRadius: '7px',
                                                cursor:
                                                    tripsUsed > 0
                                                        ? 'not-allowed'
                                                        : 'pointer',
                                            }}
                                        >
                                            <Trash2
                                                size={13}
                                                color={
                                                    tripsUsed > 0
                                                        ? '#B9C9CC'
                                                        : '#5E7A80'
                                                }
                                            />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* New row */}
                        {editingId === 'new' && (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: gridCols,
                                    gap: '0 12px',
                                    padding: '10px 24px',
                                    alignItems: 'center',
                                    background: '#F8FBFB',
                                    borderTop: '1px solid #EFF5F6',
                                }}
                            >
                                <input
                                    style={inputSt}
                                    value={draft.a}
                                    placeholder={cfg.ph1}
                                    onChange={(e) =>
                                        setDraft((d) => ({
                                            ...d,
                                            a: e.target.value,
                                        }))
                                    }
                                    autoFocus
                                />
                                {midLayout && (
                                    <input
                                        style={inputSt}
                                        value={draft.b}
                                        placeholder={cfg.ph2}
                                        onChange={(e) =>
                                            setDraft((d) => ({
                                                ...d,
                                                b: e.target.value,
                                            }))
                                        }
                                    />
                                )}
                                {wideLayout && (
                                    <input
                                        style={inputSt}
                                        value={draft.c}
                                        placeholder={cfg.ph3}
                                        onChange={(e) =>
                                            setDraft((d) => ({
                                                ...d,
                                                c: e.target.value,
                                            }))
                                        }
                                    />
                                )}
                                {midLayout && <div />}
                                <div />
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '6px',
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    <button
                                        onClick={saveNew}
                                        title="Guardar"
                                        style={{
                                            width: '30px',
                                            height: '30px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: '#1a4e57',
                                            border: 'none',
                                            borderRadius: '7px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Check size={14} color="#FFFFFF" />
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        title="Cancelar"
                                        style={{
                                            width: '30px',
                                            height: '30px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'transparent',
                                            border: '1px solid #DCE8EA',
                                            borderRadius: '7px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <X size={14} color="#5E7A80" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Error block */}
                        {error && (
                            <div
                                style={{
                                    margin: '0 24px 12px',
                                    padding: '8px 12px',
                                    background: '#FBEAE7',
                                    border: '1px solid #F5C4BC',
                                    borderRadius: '8px',
                                    fontSize: '12.5px',
                                    color: '#8A2A21',
                                }}
                            >
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 24px',
                            borderTop: '1px solid #EFF5F6',
                            flexWrap: 'wrap',
                            gap: '8px',
                        }}
                    >
                        <div style={{ fontSize: '11.5px', color: '#7E9AA0' }}>
                            {rows.length} registros ·{' '}
                            {rows.filter((r) => r.active).length} activos
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#7E9AA0' }}>
                            Los registros usados en viajes no se pueden eliminar — desactívalos.
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </>
    );
}
