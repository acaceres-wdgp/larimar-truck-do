import { Head, Link, useForm } from '@inertiajs/react';
import { Camera } from 'lucide-react';
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

interface PageProps {
    driver: DriverData | null;
}

const LICENSE_CATEGORIES = [
    'Category 04 (heavy)',
    'Category 05 (articulated)',
    'Category 03 (light truck)',
    'Hazmat endorsement',
];

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

export default function DriverForm({ driver }: PageProps) {
    const isEdit = driver !== null;

    const form = useForm<{
        first_name: string;
        last_name: string;
        national_id: string;
        phone: string;
        emergency_contact: string;
        license_number: string;
        license_category: string;
        license_expires_at: string;
        status: DriverStatus;
        notes: string;
        photo: File | null;
    }>({
        first_name: driver?.first_name ?? '',
        last_name: driver?.last_name ?? '',
        national_id: driver?.national_id ?? '',
        phone: driver?.phone ?? '',
        emergency_contact: driver?.emergency_contact ?? '',
        license_number: driver?.license_number ?? '',
        license_category: driver?.license_category ?? '',
        license_expires_at: driver?.license_expires_at ?? '',
        status: driver?.status ?? 'available',
        notes: driver?.notes ?? '',
        photo: null,
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(
        driver?.photo_path ? `/storage/${driver.photo_path}` : null,
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
            form.put(`/drivers/${driver.id}`);
        } else {
            form.post('/drivers');
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
    const firstError =
        form.errors.first_name ||
        form.errors.last_name ||
        form.errors.license_number;

    const pageTitle = isEdit
        ? `Editar ${driver.first_name} ${driver.last_name}`
        : 'Nuevo chofer';

    return (
        <>
            <Head title={pageTitle} />

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
                        Inicio /{' '}
                        <Link
                            href="/drivers"
                            style={{ color: '#4a909f', textDecoration: 'none' }}
                        >
                            Choferes
                        </Link>{' '}
                        /{' '}
                        <Link
                            href="/drivers"
                            style={{ color: '#4a909f', textDecoration: 'none' }}
                        >
                            Volver a choferes
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
                        {pageTitle}
                    </h2>
                </div>
                <div style={{ display: 'flex', gap: '9px' }}>
                    <Link
                        href="/drivers"
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
                        Cancelar
                    </Link>
                    <button
                        form="driver-form"
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
                        Guardar chofer
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
                {/* Driver details card */}
                <form id="driver-form" onSubmit={handleSubmit}>
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
                                Detalles del chofer
                            </h3>
                            <div
                                style={{ fontSize: '12.5px', color: '#5E7A80' }}
                            >
                                Los campos marcados con * son obligatorios.
                            </div>
                        </div>

                        <div style={{ padding: '20px' }}>
                            {/* IDENTITY */}
                            <div style={sectionTitleStyle}>Identidad</div>
                            <div style={fieldGridStyle}>
                                <div>
                                    <label style={labelStyle}>Nombre *</label>
                                    <input
                                        value={form.data.first_name}
                                        onChange={(e) =>
                                            form.setData(
                                                'first_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Armando"
                                        style={{
                                            ...inputStyle,
                                            borderColor: form.errors.first_name
                                                ? '#F4DAD4'
                                                : '#DCE8EA',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        Apellido *
                                    </label>
                                    <input
                                        value={form.data.last_name}
                                        onChange={(e) =>
                                            form.setData(
                                                'last_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Peña"
                                        style={{
                                            ...inputStyle,
                                            borderColor: form.errors.last_name
                                                ? '#F4DAD4'
                                                : '#DCE8EA',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        Cédula
                                    </label>
                                    <input
                                        value={form.data.national_id}
                                        onChange={(e) =>
                                            form.setData(
                                                'national_id',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="001-1234567-8"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Estado</label>
                                    <select
                                        value={form.data.status}
                                        onChange={(e) =>
                                            form.setData(
                                                'status',
                                                e.target.value as DriverStatus,
                                            )
                                        }
                                        style={inputStyle}
                                    >
                                        <option value="available">
                                            Disponible
                                        </option>
                                        <option value="on_trip">En viaje</option>
                                        <option value="on_leave">
                                            De licencia
                                        </option>
                                        <option value="inactive">
                                            Inactivo
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div style={dividerStyle} />

                            {/* CONTACT */}
                            <div style={sectionTitleStyle}>Contacto</div>
                            <div style={fieldGridStyle}>
                                <div>
                                    <label style={labelStyle}>Teléfono</label>
                                    <input
                                        value={form.data.phone}
                                        onChange={(e) =>
                                            form.setData(
                                                'phone',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="809-555-0100"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        Contacto de emergencia
                                    </label>
                                    <input
                                        value={form.data.emergency_contact}
                                        onChange={(e) =>
                                            form.setData(
                                                'emergency_contact',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Nombre + teléfono"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={dividerStyle} />

                            {/* LICENSE */}
                            <div style={sectionTitleStyle}>Licencia</div>
                            <div style={fieldGridStyle}>
                                <div>
                                    <label style={labelStyle}>
                                        Licencia de conducir *
                                    </label>
                                    <input
                                        value={form.data.license_number}
                                        onChange={(e) =>
                                            form.setData(
                                                'license_number',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="LIC-AR-001"
                                        style={{
                                            ...inputStyle,
                                            borderColor: form.errors
                                                .license_number
                                                ? '#F4DAD4'
                                                : '#DCE8EA',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        Categoría de licencia
                                    </label>
                                    <select
                                        value={form.data.license_category}
                                        onChange={(e) =>
                                            form.setData(
                                                'license_category',
                                                e.target.value,
                                            )
                                        }
                                        style={inputStyle}
                                    >
                                        <option value="">— Seleccionar —</option>
                                        {LICENSE_CATEGORIES.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        Vencimiento de licencia
                                    </label>
                                    <input
                                        type="date"
                                        value={form.data.license_expires_at}
                                        onChange={(e) =>
                                            form.setData(
                                                'license_expires_at',
                                                e.target.value,
                                            )
                                        }
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={dividerStyle} />

                            {/* NOTES */}
                            <div style={sectionTitleStyle}>Notas</div>
                            <textarea
                                value={form.data.notes}
                                onChange={(e) =>
                                    form.setData('notes', e.target.value)
                                }
                                placeholder="Rutas conocidas, certificaciones, restricciones…"
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
                            Foto
                        </h3>
                        <div style={{ fontSize: '12.5px', color: '#5E7A80' }}>
                            Se usa en listas de despacho y asignaciones de viaje.
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
                                width: '132px',
                                height: '132px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                background: '#EDF3F4',
                                border: '1px solid #E0EBED',
                                cursor: 'pointer',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto',
                            }}
                        >
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Driver photo"
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
                                    <span
                                        style={{
                                            fontSize: '11.5px',
                                            textAlign: 'center',
                                        }}
                                    >
                                        Agregar foto
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
                                textAlign: 'center',
                            }}
                        >
                            Foto cuadrada, mínimo 400×400. Si no hay foto se
                            muestran las iniciales del chofer.
                        </p>
                    </div>
                </section>
            </div>
        </>
    );
}
