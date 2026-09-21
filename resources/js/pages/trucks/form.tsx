import { Head, Link, useForm } from '@inertiajs/react';
import { Camera } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type TruckStatus =
    | 'available'
    | 'on_trip'
    | 'in_maintenance'
    | 'out_of_service';

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

interface PageProps {
    truck: TruckData | null;
    bodyTypes: string[];
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #DCE8EA',
    background: '#F8FBFB',
    borderRadius: '9px',
    padding: '10px 12px',
    fontSize: '13.5px',
    color: '#123238',
    outline: 'none',
    fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12.5px',
    fontWeight: 500,
    color: '#3D5F66',
    marginBottom: '6px',
};

const sectionTitleStyle: React.CSSProperties = {
    fontSize: '10.5px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#7E9AA0',
    marginBottom: '12px',
};

const dividerStyle: React.CSSProperties = {
    height: '1px',
    background: '#EFF5F6',
    margin: '22px 0 18px',
};

export default function TruckForm({ truck, bodyTypes }: PageProps) {
    const isEdit = truck !== null;

    const form = useForm<{
        plate: string;
        vin: string;
        make: string;
        model: string;
        year: string;
        type: string;
        capacity_tons: string;
        odometer_km: string;
        status: TruckStatus;
        insurance_expires_at: string;
        inspection_expires_at: string;
        notes: string;
        photo: File | null;
    }>({
        plate: truck?.plate ?? '',
        vin: truck?.vin ?? '',
        make: truck?.make ?? '',
        model: truck?.model ?? '',
        year: truck?.year?.toString() ?? '',
        type: truck?.type ?? 'Tractor unit',
        capacity_tons: truck?.capacity_tons?.toString() ?? '',
        odometer_km: truck?.odometer_km?.toString() ?? '',
        status: truck?.status ?? 'available',
        insurance_expires_at: truck?.insurance_expires_at ?? '',
        inspection_expires_at: truck?.inspection_expires_at ?? '',
        notes: truck?.notes ?? '',
        photo: null,
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(
        truck?.photo_path ? `/storage/${truck.photo_path}` : null,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    const outerRef = useRef<HTMLDivElement>(null);
    const [outerW, setOuterW] = useState(900);
    const formRef = useRef<HTMLDivElement>(null);
    const [formW, setFormW] = useState(600);

    useEffect(() => {
        const el = outerRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const e = entries[0];
            if (e) setOuterW(e.contentRect.width);
        });
        ro.observe(el);
        setOuterW(el.getBoundingClientRect().width);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const el = formRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const e = entries[0];
            if (e) setFormW(e.contentRect.width);
        });
        ro.observe(el);
        setFormW(el.getBoundingClientRect().width);
        return () => ro.disconnect();
    }, []);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit) {
            form.put(`/trucks/${truck.id}`);
        } else {
            form.post('/trucks');
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        form.setData('photo', file);
        if (file) {
            const url = URL.createObjectURL(file);
            setPhotoPreview(url);
        }
    }

    const twoColOuter = outerW >= 1080;
    const twoColFields = formW >= 760;

    const fieldGridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: twoColFields ? '1fr 1fr' : '1fr',
        gap: '14px 16px',
    };

    const hasErrors = Object.keys(form.errors).length > 0;
    const firstError = form.errors.plate || form.errors.make;

    return (
        <>
            <Head title={isEdit ? `Edit ${truck.plate}` : 'New truck'} />

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
                        /{' '}
                        <Link
                            href="/trucks"
                            style={{ color: '#4a909f', textDecoration: 'none' }}
                        >
                            Back to fleet
                        </Link>
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
                        {isEdit ? `Edit ${truck.plate}` : 'New truck'}
                    </h2>
                </div>
                <div style={{ display: 'flex', gap: '9px' }}>
                    <Link
                        href="/trucks"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            border: '1px solid #DCE8EA',
                            background: '#FFFFFF',
                            color: '#1a4e57',
                            fontSize: '13.5px',
                            fontWeight: 500,
                            padding: '9px 15px',
                            borderRadius: '9px',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Cancel
                    </Link>
                    <button
                        form="truck-form"
                        type="submit"
                        disabled={form.processing}
                        style={{
                            border: 'none',
                            background: form.processing ? '#5E7A80' : '#1a4e57',
                            color: '#FFFFFF',
                            fontSize: '13.5px',
                            fontWeight: 500,
                            padding: '9px 16px',
                            borderRadius: '9px',
                            cursor: form.processing ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Save truck
                    </button>
                </div>
            </div>

            {/* Two-column grid */}
            <div
                ref={outerRef}
                style={{
                    display: 'grid',
                    gridTemplateColumns: twoColOuter ? '1.7fr 1fr' : '1fr',
                    gap: '18px',
                    alignItems: 'start',
                }}
            >
                {/* Truck details card */}
                <form id="truck-form" onSubmit={handleSubmit}>
                    <section
                        ref={formRef}
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
                                Truck details
                            </h3>
                            <div
                                style={{ fontSize: '12.5px', color: '#5E7A80' }}
                            >
                                Fields marked with * are required.
                            </div>
                        </div>

                        <div style={{ padding: '20px' }}>
                            {/* IDENTIFICATION */}
                            <div style={sectionTitleStyle}>Identification</div>
                            <div style={fieldGridStyle}>
                                <div>
                                    <label style={labelStyle}>Plate *</label>
                                    <input
                                        value={form.data.plate}
                                        onChange={(e) =>
                                            form.setData(
                                                'plate',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="AM-2021"
                                        style={{
                                            ...inputStyle,
                                            borderColor: form.errors.plate
                                                ? '#F4DAD4'
                                                : '#DCE8EA',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        VIN / chassis number
                                    </label>
                                    <input
                                        value={form.data.vin}
                                        onChange={(e) =>
                                            form.setData('vin', e.target.value)
                                        }
                                        placeholder="1FUJGLDR7CLBP8834"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Make *</label>
                                    <input
                                        value={form.data.make}
                                        onChange={(e) =>
                                            form.setData('make', e.target.value)
                                        }
                                        placeholder="Freightliner"
                                        style={{
                                            ...inputStyle,
                                            borderColor: form.errors.make
                                                ? '#F4DAD4'
                                                : '#DCE8EA',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Model</label>
                                    <input
                                        value={form.data.model}
                                        onChange={(e) =>
                                            form.setData(
                                                'model',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Cascadia 126"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Year</label>
                                    <input
                                        value={form.data.year}
                                        onChange={(e) =>
                                            form.setData('year', e.target.value)
                                        }
                                        placeholder="2019"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Status</label>
                                    <select
                                        value={form.data.status}
                                        onChange={(e) =>
                                            form.setData(
                                                'status',
                                                e.target.value as TruckStatus,
                                            )
                                        }
                                        style={inputStyle}
                                    >
                                        <option value="available">
                                            Available
                                        </option>
                                        <option value="on_trip">On trip</option>
                                        <option value="in_maintenance">
                                            In maintenance
                                        </option>
                                        <option value="out_of_service">
                                            Out of service
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div style={dividerStyle} />

                            {/* SPECIFICATION */}
                            <div style={sectionTitleStyle}>Specification</div>
                            <div style={fieldGridStyle}>
                                <div>
                                    <label style={labelStyle}>Body type</label>
                                    <select
                                        value={form.data.type}
                                        onChange={(e) =>
                                            form.setData('type', e.target.value)
                                        }
                                        style={inputStyle}
                                    >
                                        {bodyTypes.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        Capacity (tons)
                                    </label>
                                    <input
                                        value={form.data.capacity_tons}
                                        onChange={(e) =>
                                            form.setData(
                                                'capacity_tons',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="30"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        Odometer (km)
                                    </label>
                                    <input
                                        value={form.data.odometer_km}
                                        onChange={(e) =>
                                            form.setData(
                                                'odometer_km',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="412000"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={dividerStyle} />

                            {/* COMPLIANCE */}
                            <div style={sectionTitleStyle}>Compliance</div>
                            <div style={fieldGridStyle}>
                                <div>
                                    <label style={labelStyle}>
                                        Insurance expires
                                    </label>
                                    <input
                                        type="date"
                                        value={form.data.insurance_expires_at}
                                        onChange={(e) =>
                                            form.setData(
                                                'insurance_expires_at',
                                                e.target.value,
                                            )
                                        }
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        Inspection expires
                                    </label>
                                    <input
                                        type="date"
                                        value={form.data.inspection_expires_at}
                                        onChange={(e) =>
                                            form.setData(
                                                'inspection_expires_at',
                                                e.target.value,
                                            )
                                        }
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={dividerStyle} />

                            {/* NOTES */}
                            <label style={labelStyle}>Notes</label>
                            <textarea
                                value={form.data.notes}
                                onChange={(e) =>
                                    form.setData('notes', e.target.value)
                                }
                                placeholder="Maintenance history, restrictions, permits…"
                                rows={4}
                                style={{
                                    ...inputStyle,
                                    minHeight: '96px',
                                    resize: 'vertical',
                                    lineHeight: 1.5,
                                }}
                            />

                            {/* Validation error block */}
                            {hasErrors && (
                                <div
                                    style={{
                                        marginTop: '14px',
                                        fontSize: '12.5px',
                                        color: '#B14C3C',
                                        background: '#FCEFEC',
                                        border: '1px solid #F4DAD4',
                                        borderRadius: '8px',
                                        padding: '9px 11px',
                                    }}
                                >
                                    {firstError ??
                                        Object.values(form.errors)[0]}
                                </div>
                            )}
                        </div>
                    </section>
                </form>

                {/* Photo card */}
                <section
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
                                fontSize: '15.5px',
                                letterSpacing: '-0.015em',
                                margin: '0 0 3px',
                                color: '#123238',
                            }}
                        >
                            Photo
                        </h3>
                        <div style={{ fontSize: '12.5px', color: '#5E7A80' }}>
                            Shown on the trip board and dispatch lists.
                        </div>
                    </div>
                    <div style={{ padding: '20px' }}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '100%',
                                height: '168px',
                                borderRadius: '11px',
                                overflow: 'hidden',
                                background: '#EDF3F4',
                                border: '1px solid #E0EBED',
                                cursor: 'pointer',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Truck photo"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: '#7E9AA0',
                                    }}
                                >
                                    <Camera size={28} strokeWidth={1.5} />
                                    <span style={{ fontSize: '12.5px' }}>
                                        Drop a truck photo
                                    </span>
                                </div>
                            )}
                        </div>
                        <p
                            style={{
                                fontSize: '11.5px',
                                lineHeight: 1.5,
                                color: '#5E7A80',
                                marginTop: '12px',
                                marginBottom: 0,
                            }}
                        >
                            JPG or PNG, landscape, at least 640×480. A clear
                            side view works best for dispatchers.
                        </p>
                    </div>
                </section>
            </div>
        </>
    );
}
