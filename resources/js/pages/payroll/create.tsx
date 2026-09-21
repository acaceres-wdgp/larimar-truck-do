import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';

interface EligibleTrip {
    id: number;
    date: string;
    client: string;
    from: string;
    to: string;
    driver_id: number;
    driver_name: string;
    driver_pay: number;
    rate: number;
    km: number;
}

interface CreatePayrollProps {
    eligibleTrips: EligibleTrip[];
}

const MONTHS_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatDate(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function CreatePayroll({ eligibleTrips }: CreatePayrollProps) {
    const [periodStart, setPeriodStart] = useState('');
    const [periodEnd, setPeriodEnd] = useState('');
    const [selectedTripIds, setSelectedTripIds] = useState<Set<number>>(new Set());
    const [expandedDrivers, setExpandedDrivers] = useState<Set<number>>(new Set());
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Filter eligible trips by selected period
    const tripsInPeriod = useMemo(() => {
        if (!periodStart || !periodEnd) return [];
        return eligibleTrips.filter(t => t.date >= periodStart && t.date <= periodEnd);
    }, [eligibleTrips, periodStart, periodEnd]);

    // Group by driver
    const driverGroups = useMemo(() => {
        const map = new Map<number, { driver_name: string; trips: EligibleTrip[] }>();
        for (const t of tripsInPeriod) {
            if (!map.has(t.driver_id)) {
                map.set(t.driver_id, { driver_name: t.driver_name, trips: [] });
            }
            map.get(t.driver_id)!.trips.push(t);
        }
        return Array.from(map.entries()).map(([driver_id, v]) => ({ driver_id, ...v }));
    }, [tripsInPeriod]);

    const totalSelected = useMemo(() => {
        return tripsInPeriod.filter(t => selectedTripIds.has(t.id)).reduce((sum, t) => sum + t.driver_pay, 0);
    }, [tripsInPeriod, selectedTripIds]);

    const selectedCount = useMemo(() => {
        return tripsInPeriod.filter(t => selectedTripIds.has(t.id)).length;
    }, [tripsInPeriod, selectedTripIds]);

    const selectedDriverCount = useMemo(() => {
        const driverIds = new Set<number>();
        tripsInPeriod.filter(t => selectedTripIds.has(t.id)).forEach(t => driverIds.add(t.driver_id));
        return driverIds.size;
    }, [tripsInPeriod, selectedTripIds]);

    function toggleTrip(id: number) {
        setSelectedTripIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    function toggleDriverTrips(driverId: number, trips: EligibleTrip[]) {
        const allSelected = trips.every(t => selectedTripIds.has(t.id));
        setSelectedTripIds(prev => {
            const next = new Set(prev);
            if (allSelected) {
                trips.forEach(t => next.delete(t.id));
            } else {
                trips.forEach(t => next.add(t.id));
            }
            return next;
        });
    }

    function selectAll() {
        setSelectedTripIds(new Set(tripsInPeriod.map(t => t.id)));
    }

    function deselectAll() {
        setSelectedTripIds(new Set());
    }

    function toggleDriver(driverId: number) {
        setExpandedDrivers(prev => {
            const next = new Set(prev);
            if (next.has(driverId)) next.delete(driverId); else next.add(driverId);
            return next;
        });
    }

    function handleSubmit() {
        if (selectedCount === 0 || submitting) return;
        setSubmitting(true);
        router.post('/payroll', {
            period_start: periodStart,
            period_end: periodEnd,
            trip_ids: [...selectedTripIds],
            notes: notes || null,
        }, {
            onFinish: () => setSubmitting(false),
        });
    }

    const inputStyle: React.CSSProperties = {
        border: '1px solid #DCE8EA',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '13px',
        color: '#123238',
        background: '#FFFFFF',
        outline: 'none',
        width: '100%',
    };

    const cardStyle: React.CSSProperties = {
        background: '#FFFFFF',
        border: '1px solid #E0EBED',
        borderRadius: '14px',
        overflow: 'hidden',
        marginBottom: '20px',
    };

    const cardHeaderStyle: React.CSSProperties = {
        padding: '16px 20px',
        borderBottom: '1px solid #E0EBED',
        fontFamily: "'Bitter', Georgia, serif",
        fontWeight: 600,
        fontSize: '15px',
        color: '#123238',
    };

    return (
        <>
            <Head title="Nuevo ciclo de nómina" />

            <div style={{ maxWidth: '900px' }}>
                {/* Back link */}
                <div style={{ marginBottom: '16px' }}>
                    <a
                        href="/payroll"
                        style={{ fontSize: '13px', color: '#5E7A80', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                        ← Volver a Nómina
                    </a>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontFamily: "'Bitter', Georgia, serif", fontSize: '22px', fontWeight: 700, color: '#123238', margin: 0 }}>
                        Nuevo ciclo de nómina
                    </h1>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#5E7A80' }}>
                        Selecciona un período y los viajes a incluir en este ciclo de nómina.
                    </p>
                </div>

                {/* Period selector */}
                <div style={cardStyle}>
                    <div style={cardHeaderStyle}>Período</div>
                    <div style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '160px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#5E7A80', marginBottom: '6px' }}>Desde</label>
                            <input
                                type="date"
                                value={periodStart}
                                onChange={e => { setPeriodStart(e.target.value); setSelectedTripIds(new Set()); }}
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: '160px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#5E7A80', marginBottom: '6px' }}>Hasta</label>
                            <input
                                type="date"
                                value={periodEnd}
                                min={periodStart}
                                onChange={e => { setPeriodEnd(e.target.value); setSelectedTripIds(new Set()); }}
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </div>

                {/* Trips preview */}
                {periodStart && periodEnd && (
                    <div style={cardStyle}>
                        <div style={{
                            ...cardHeaderStyle,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '8px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Viajes en el período
                                <span style={{
                                    background: '#EEF4F5',
                                    color: '#1a4e57',
                                    borderRadius: '20px',
                                    padding: '2px 9px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                }}>
                                    {tripsInPeriod.length}
                                </span>
                            </div>
                            {tripsInPeriod.length > 0 && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={selectAll} style={smallBtnStyle('#1a4e57', '#FFFFFF')}>Seleccionar todo</button>
                                    <button onClick={deselectAll} style={smallBtnStyle('#EEF4F5', '#1a4e57')}>Deseleccionar todo</button>
                                </div>
                            )}
                        </div>

                        {tripsInPeriod.length === 0 ? (
                            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9DB3B8', fontSize: '13px' }}>
                                No hay viajes elegibles en este período.
                            </div>
                        ) : (
                            <div>
                                {driverGroups.map(group => {
                                    const allChecked = group.trips.every(t => selectedTripIds.has(t.id));
                                    const someChecked = group.trips.some(t => selectedTripIds.has(t.id));
                                    const driverTotal = group.trips.filter(t => selectedTripIds.has(t.id)).reduce((s, t) => s + t.driver_pay, 0);
                                    const expanded = expandedDrivers.has(group.driver_id);

                                    return (
                                        <div key={group.driver_id} style={{ borderBottom: '1px solid #F0F4F5' }}>
                                            {/* Driver header row */}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '12px 20px',
                                                    background: '#F9FBFC',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => toggleDriver(group.driver_id)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={allChecked}
                                                    ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                                                    onChange={() => toggleDriverTrips(group.driver_id, group.trips)}
                                                    onClick={e => e.stopPropagation()}
                                                    style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#1a4e57' }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#123238' }}>
                                                        {group.driver_name}
                                                    </span>
                                                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#5E7A80' }}>
                                                        {group.trips.length} {group.trips.length === 1 ? 'viaje' : 'viajes'}
                                                    </span>
                                                </div>
                                                <div style={{ fontFamily: "'Bitter', Georgia, serif", fontWeight: 600, fontSize: '14px', color: '#1a4e57' }}>
                                                    RD${group.trips.reduce((s, t) => s + t.driver_pay, 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                                </div>
                                                <span style={{ fontSize: '12px', color: '#9DB3B8' }}>{expanded ? '▲' : '▼'}</span>
                                            </div>

                                            {/* Trip rows */}
                                            {expanded && (
                                                <div style={{ overflowX: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead>
                                                            <tr>
                                                                <th style={subThStyle}></th>
                                                                <th style={subThStyle}>Fecha</th>
                                                                <th style={subThStyle}>Cliente</th>
                                                                <th style={subThStyle}>Ruta</th>
                                                                <th style={{ ...subThStyle, textAlign: 'right' }}>Pago al chofer</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {group.trips.map(trip => (
                                                                <tr
                                                                    key={trip.id}
                                                                    style={{ background: selectedTripIds.has(trip.id) ? '#F0F7F8' : '#FFFFFF' }}
                                                                >
                                                                    <td style={{ ...subTdStyle, width: '40px' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedTripIds.has(trip.id)}
                                                                            onChange={() => toggleTrip(trip.id)}
                                                                            style={{ width: '14px', height: '14px', accentColor: '#1a4e57', cursor: 'pointer' }}
                                                                        />
                                                                    </td>
                                                                    <td style={{ ...subTdStyle, color: '#5E7A80' }}>{formatDate(trip.date)}</td>
                                                                    <td style={subTdStyle}>{trip.client}</td>
                                                                    <td style={{ ...subTdStyle, color: '#5E7A80' }}>{trip.from} → {trip.to}</td>
                                                                    <td style={{ ...subTdStyle, textAlign: 'right', fontWeight: 600, color: '#1a4e57' }}>
                                                                        RD${trip.driver_pay.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Notes */}
                <div style={cardStyle}>
                    <div style={cardHeaderStyle}>Notas (opcional)</div>
                    <div style={{ padding: '16px 20px' }}>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Agrega notas sobre este ciclo de nómina..."
                            rows={3}
                            style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
                        />
                    </div>
                </div>

                {/* Summary / actions */}
                <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E0EBED',
                    borderRadius: '14px',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                }}>
                    <div>
                        {selectedCount > 0 ? (
                            <>
                                <div style={{ fontFamily: "'Bitter', Georgia, serif", fontWeight: 700, fontSize: '20px', color: '#1a4e57' }}>
                                    RD${totalSelected.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                </div>
                                <div style={{ fontSize: '12px', color: '#5E7A80', marginTop: '2px' }}>
                                    {selectedDriverCount} {selectedDriverCount === 1 ? 'chofer' : 'choferes'}, {selectedCount} {selectedCount === 1 ? 'viaje' : 'viajes'} seleccionados
                                </div>
                            </>
                        ) : (
                            <div style={{ fontSize: '13px', color: '#9DB3B8' }}>No hay viajes seleccionados</div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <a
                            href="/payroll"
                            style={{
                                padding: '9px 18px',
                                background: '#EEF4F5',
                                color: '#1a4e57',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 500,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}
                        >
                            Cancelar
                        </a>
                        <button
                            onClick={handleSubmit}
                            disabled={selectedCount === 0 || submitting}
                            style={{
                                padding: '9px 20px',
                                background: selectedCount === 0 ? '#B0C8CC' : '#1a4e57',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 500,
                                cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
                                transition: 'background 0.12s',
                            }}
                        >
                            {submitting ? 'Creando…' : 'Crear ciclo de nómina →'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function smallBtnStyle(bg: string, fg: string): React.CSSProperties {
    return {
        padding: '4px 12px',
        background: bg,
        color: fg,
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
    };
}

const subThStyle: React.CSSProperties = {
    padding: '7px 16px',
    textAlign: 'left',
    fontSize: '10px',
    fontWeight: 600,
    color: '#5E7A80',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #E0EBED',
    background: '#F5F9FA',
};

const subTdStyle: React.CSSProperties = {
    padding: '9px 16px',
    borderBottom: '1px solid #F0F4F5',
    fontSize: '12px',
    color: '#2c2c2c',
};
