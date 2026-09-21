import { Head, Link, useForm } from '@inertiajs/react';
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

interface PageProps {
    client: ClientData | null;
}

const PAYMENT_TERMS_OPTIONS = [
    'Cash on delivery',
    '15 days',
    '30 days',
    '45 days',
    '60 days',
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
    boxSizing: 'border-box',
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

function getInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

export default function ClientForm({ client }: PageProps) {
    const isEdit = client !== null;

    const form = useForm<{
        name: string;
        kind: string;
        tax_id: string;
        contact_name: string;
        contact_role: string;
        contact_phone: string;
        contact_email: string;
        payment_terms: string;
        credit_limit: string;
        status: string;
        client_since: string;
        logo: File | null;
    }>({
        name: client?.name ?? '',
        kind: client?.kind ?? 'Company',
        tax_id: client?.tax_id ?? '',
        contact_name: client?.contact_name ?? '',
        contact_role: client?.contact_role ?? '',
        contact_phone: client?.contact_phone ?? '',
        contact_email: client?.contact_email ?? '',
        payment_terms: client?.payment_terms ?? '30 days',
        credit_limit:
            client?.credit_limit != null ? String(client.credit_limit) : '',
        status: client?.status ?? 'Active',
        client_since: client?.client_since ?? '',
        logo: null,
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(
        client?.logo_path ? `/storage/${client.logo_path}` : null,
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
            form.put(`/clients/${client.id}`);
        } else {
            form.post('/clients');
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        form.setData('logo', file);
        if (file) {
            const url = URL.createObjectURL(file);
            setLogoPreview(url);
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
    const firstError = form.errors.name || form.errors.tax_id;

    const pageTitle = isEdit ? `Edit ${client.name}` : 'New client';

    const previewInitials = form.data.name ? getInitials(form.data.name) : '??';

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
                        Home / Clients /{' '}
                        <Link
                            href="/clients"
                            style={{ color: '#4a909f', textDecoration: 'none' }}
                        >
                            Back to clients
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
                        href="/clients"
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
                        form="client-form"
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
                        Save client
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
                {/* Client details card */}
                <form id="client-form" onSubmit={handleSubmit}>
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
                                Client details
                            </h3>
                            <div
                                style={{ fontSize: '12.5px', color: '#5E7A80' }}
                            >
                                Fields marked with * are required.
                            </div>
                        </div>

                        <div style={{ padding: '20px' }}>
                            {/* ACCOUNT */}
                            <div style={sectionTitleStyle}>Account</div>
                            <div style={fieldGridStyle}>
                                <div>
                                    <label style={labelStyle}>
                                        Client type
                                    </label>
                                    <select
                                        value={form.data.kind}
                                        onChange={(e) =>
                                            form.setData('kind', e.target.value)
                                        }
                                        style={inputStyle}
                                    >
                                        <option value="Company">Company</option>
                                        <option value="Individual">
                                            Individual
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Status</label>
                                    <select
                                        value={form.data.status}
                                        onChange={(e) =>
                                            form.setData(
                                                'status',
                                                e.target.value,
                                            )
                                        }
                                        style={inputStyle}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">
                                            Inactive
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        Legal name *
                                    </label>
                                    <input
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                        placeholder="Imagine SRL"
                                        style={{
                                            ...inputStyle,
                                            borderColor: form.errors.name
                                                ? '#F4DAD4'
                                                : '#DCE8EA',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        RNC / Tax ID *
                                    </label>
                                    <input
                                        value={form.data.tax_id}
                                        onChange={(e) =>
                                            form.setData(
                                                'tax_id',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="130-45781-2"
                                        style={{
                                            ...inputStyle,
                                            borderColor: form.errors.tax_id
                                                ? '#F4DAD4'
                                                : '#DCE8EA',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        Client since
                                    </label>
                                    <input
                                        type="date"
                                        value={form.data.client_since}
                                        onChange={(e) =>
                                            form.setData(
                                                'client_since',
                                                e.target.value,
                                            )
                                        }
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={dividerStyle} />

                            {/* PRIMARY CONTACT */}
                            <div style={sectionTitleStyle}>Primary contact</div>
                            <div style={fieldGridStyle}>
                                <div>
                                    <label style={labelStyle}>
                                        Contact name
                                    </label>
                                    <input
                                        value={form.data.contact_name}
                                        onChange={(e) =>
                                            form.setData(
                                                'contact_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Niurka Fernández"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Role</label>
                                    <input
                                        value={form.data.contact_role}
                                        onChange={(e) =>
                                            form.setData(
                                                'contact_role',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Logistics manager"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone</label>
                                    <input
                                        value={form.data.contact_phone}
                                        onChange={(e) =>
                                            form.setData(
                                                'contact_phone',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="+1 809 555 0100"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <input
                                        type="email"
                                        value={form.data.contact_email}
                                        onChange={(e) =>
                                            form.setData(
                                                'contact_email',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="logistica@imagine.do"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={dividerStyle} />

                            {/* BILLING */}
                            <div style={sectionTitleStyle}>Billing</div>
                            <div style={fieldGridStyle}>
                                <div>
                                    <label style={labelStyle}>
                                        Payment terms
                                    </label>
                                    <select
                                        value={form.data.payment_terms}
                                        onChange={(e) =>
                                            form.setData(
                                                'payment_terms',
                                                e.target.value,
                                            )
                                        }
                                        style={inputStyle}
                                    >
                                        {PAYMENT_TERMS_OPTIONS.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        Credit limit (RD$)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={form.data.credit_limit}
                                        onChange={(e) =>
                                            form.setData(
                                                'credit_limit',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="1000000"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

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

                {/* Logo card */}
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
                            Logo
                        </h3>
                        <div style={{ fontSize: '12.5px', color: '#5E7A80' }}>
                            Shown in lists, invoices and trip documents.
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
                                width: '168px',
                                height: '168px',
                                borderRadius: '14px',
                                overflow: 'hidden',
                                background: '#EDF3F4',
                                border: '1px solid #E0EBED',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto',
                            }}
                        >
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Client logo"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : (
                                <span
                                    style={{
                                        fontFamily: "'Bitter', Georgia, serif",
                                        fontWeight: 600,
                                        fontSize: '36px',
                                        color: '#1a4e57',
                                        lineHeight: 1,
                                    }}
                                >
                                    {previewInitials}
                                </span>
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
                            PNG with transparent background works best. Without
                            a logo we show the client's initials.
                        </p>
                    </div>
                </section>
            </div>
        </>
    );
}
