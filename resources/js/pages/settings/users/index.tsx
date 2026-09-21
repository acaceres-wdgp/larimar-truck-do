import { Head, Link, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SettingsLayout from '@/layouts/settings-layout';

interface UserRow {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    job_title: string | null;
    role: string;
    status: 'active' | 'invited' | 'suspended';
    last_active: string;
    access: string;
}

interface PageProps {
    users: UserRow[];
}

const ROLES: Record<
    string,
    { color: string; label: string; description: string }
> = {
    administrator: {
        color: '#1a4e57',
        label: 'Administrador',
        description: 'Acceso total, incluyendo usuarios, catálogos y facturación.',
    },
    operations: {
        color: '#2E8055',
        label: 'Operaciones',
        description: 'Gestiona el tablero y la flota. Sin administración de usuarios.',
    },
    dispatcher: {
        color: '#B07C2E',
        label: 'Despachador',
        description: 'Programa y actualiza viajes. Solo lectura en el resto.',
    },
    accountant: {
        color: '#4A6BB0',
        label: 'Contador',
        description: 'Facturas, cuentas por cobrar y datos de facturación de clientes.',
    },
    viewer: {
        color: '#8AA4A9',
        label: 'Observador',
        description: 'Solo visualiza. Ideal para propietarios y auditores.',
    },
    custom: {
        color: '#7E9AA0',
        label: 'Personalizado',
        description: 'Permisos seleccionados manualmente.',
    },
};

const STATUS_COLORS = {
    active: { bg: '#E6F4EC', text: '#1F5C3D', dot: '#2E8055' },
    invited: { bg: '#FBF1DF', text: '#7A5312', dot: '#B07C2E' },
    suspended: { bg: '#FCEFEC', text: '#8E3626', dot: '#B14C3C' },
};

function nameHash(name: string): number {
    let h = 0;
    for (let i = 0; i < name.length; i++) {
        h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(h);
}

const AVATAR_COLORS = [
    '#4a909f',
    '#2E8055',
    '#B07C2E',
    '#4A6BB0',
    '#7E4A8E',
    '#B05050',
    '#5E7A80',
    '#1a4e57',
];

function getAvatarBg(name: string): string {
    return AVATAR_COLORS[nameHash(name) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}

function getCsrfToken(): string {
    const meta = document.querySelector(
        'meta[name="csrf-token"]',
    ) as HTMLMetaElement | null;
    return meta?.content ?? '';
}

export default function UsersIndex({ users: initialUsers }: PageProps) {
    const page = usePage();
    const currentUserId = (page.props.auth as any)?.user?.id as
        | number
        | undefined;

    const [users, setUsers] = useState<UserRow[]>(initialUsers);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerW, setContainerW] = useState(1300);

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

    const lg = containerW >= 1180;
    const md = containerW >= 940;

    let gridCols: string;
    if (lg) {
        gridCols = 'minmax(0,1.6fr) 132px minmax(0,1fr) 116px 108px 78px';
    } else if (md) {
        gridCols = 'minmax(0,1.6fr) 132px 116px 108px 78px';
    } else {
        gridCols = 'minmax(0,1fr) 108px 78px';
    }

    const filtered = users.filter((u) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q) ||
            (u.job_title ?? '').toLowerCase().includes(q)
        );
    });

    function showToast(message: string, type: 'success' | 'error' = 'success') {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    }

    async function handleDelete(user: UserRow) {
        if (user.id === currentUserId) {
            showToast('No puedes eliminar tu propia cuenta', 'error');
            return;
        }
        if (!confirm(`¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`)) return;

        const res = await fetch(`/settings/users/${user.id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
                Accept: 'application/json',
            },
        });

        if (res.ok) {
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
            showToast(`${user.name} eliminado`);
        } else {
            const data = await res.json().catch(() => ({}));
            showToast(data.error ?? 'No se pudo eliminar el usuario', 'error');
        }
    }

    async function handleToggleStatus(user: UserRow) {
        if (user.id === currentUserId) {
            showToast('No puedes suspender tu propia cuenta', 'error');
            return;
        }

        const res = await fetch(`/settings/users/${user.id}/suspend`, {
            method: 'PATCH',
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
                Accept: 'application/json',
            },
        });

        if (res.ok) {
            const data = await res.json();
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === user.id ? { ...u, status: data.status } : u,
                ),
            );
        } else {
            const data = await res.json().catch(() => ({}));
            showToast(data.error ?? 'No se pudo actualizar el estado', 'error');
        }
    }

    // Compute role user counts
    const roleCounts: Record<string, number> = {};
    users.forEach((u) => {
        roleCounts[u.role] = (roleCounts[u.role] ?? 0) + 1;
    });

    const activeCount = users.filter((u) => u.status === 'active').length;
    const invitedCount = users.filter((u) => u.status === 'invited').length;

    const hdrSt: React.CSSProperties = {
        fontSize: '11px',
        fontWeight: 600,
        color: '#7E9AA0',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
    };

    return (
        <>
            <Head title="Configuración – Usuarios" />
            <SettingsLayout
                ctaLabel="Invitar usuario"
                onCta={() => {
                    window.location.href = '/settings/users/create';
                }}
            >
                {/* Toast */}
                {toast && (
                    <div
                        style={{
                            position: 'fixed',
                            bottom: '28px',
                            right: '28px',
                            padding: '10px 18px',
                            background:
                                toast.type === 'error' ? '#FCEFEC' : '#E6F4EC',
                            border: `1px solid ${toast.type === 'error' ? '#F5C4BC' : '#B8E0C4'}`,
                            borderRadius: '10px',
                            fontSize: '13px',
                            color:
                                toast.type === 'error' ? '#8E3626' : '#1F5C3D',
                            zIndex: 999,
                            boxShadow: '0 4px 16px rgba(18,50,56,0.10)',
                        }}
                    >
                        {toast.message}
                    </div>
                )}

                {/* Search */}
                <div style={{ marginBottom: '16px' }}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo, rol…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            padding: '8px 14px',
                            border: '1px solid #DCE8EA',
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: '#123238',
                            outline: 'none',
                            width: '280px',
                            background: '#FFFFFF',
                        }}
                    />
                </div>

                {/* Users table */}
                <div
                    ref={containerRef}
                    style={{
                        background: '#FFFFFF',
                        border: '1px solid #E0EBED',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        marginBottom: '32px',
                    }}
                >
                    {/* Column headers */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: gridCols,
                            gap: '0 12px',
                            padding: '10px 20px',
                            borderBottom: '1px solid #EFF5F6',
                            alignItems: 'center',
                        }}
                    >
                        <div style={hdrSt}>Usuario</div>
                        <div style={hdrSt}>Rol</div>
                        {lg && <div style={hdrSt}>Acceso</div>}
                        {md && <div style={hdrSt}>Último acceso</div>}
                        <div style={hdrSt}>Estado</div>
                        <div style={{ ...hdrSt, textAlign: 'right' }}>
                            Acciones
                        </div>
                    </div>

                    {/* Rows */}
                    {filtered.map((user) => {
                        const isOwn = user.id === currentUserId;
                        const role = ROLES[user.role] ?? {
                            color: '#7E9AA0',
                            label: user.role,
                        };
                        const sc = STATUS_COLORS[user.status];

                        return (
                            <div
                                key={user.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: gridCols,
                                    gap: '0 12px',
                                    padding: '11px 20px',
                                    alignItems: 'center',
                                    borderTop: '1px solid #EFF5F6',
                                }}
                            >
                                {/* User cell */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        minWidth: 0,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '34px',
                                            height: '34px',
                                            borderRadius: '50%',
                                            background: getAvatarBg(user.name),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: '#FFFFFF',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {getInitials(user.name)}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
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
                                            {user.name}
                                            {isOwn && (
                                                <span
                                                    style={{
                                                        fontSize: '11px',
                                                        color: '#7E9AA0',
                                                        marginLeft: '6px',
                                                    }}
                                                >
                                                    (tú)
                                                </span>
                                            )}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#5E7A80',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {user.email}
                                        </div>
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            color: role.color,
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: role.color,
                                                flexShrink: 0,
                                            }}
                                        />
                                        {role.label}
                                    </span>
                                </div>

                                {/* Access */}
                                {lg && (
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            color: '#5E7A80',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {user.access}
                                    </div>
                                )}

                                {/* Last active */}
                                {md && (
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            color: '#5E7A80',
                                        }}
                                    >
                                        {user.last_active}
                                    </div>
                                )}

                                {/* Status chip */}
                                <div>
                                    <button
                                        onClick={() => handleToggleStatus(user)}
                                        disabled={isOwn}
                                        title={
                                            isOwn
                                                ? 'No puedes cambiar tu propio estado'
                                                : 'Cambiar estado'
                                        }
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            padding: '3px 9px',
                                            borderRadius: '20px',
                                            border: `1px solid ${sc.dot}30`,
                                            background: sc.bg,
                                            cursor: isOwn
                                                ? 'default'
                                                : 'pointer',
                                            fontSize: '11.5px',
                                            fontWeight: 500,
                                            color: sc.text,
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: sc.dot,
                                                flexShrink: 0,
                                            }}
                                        />
                                        {{ active: 'Activo', invited: 'Invitado', suspended: 'Suspendido' }[user.status] ?? user.status}
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
                                    <Link
                                        href={`/settings/users/${user.id}/edit`}
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
                                            textDecoration: 'none',
                                        }}
                                    >
                                        <Pencil size={13} color="#5E7A80" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(user)}
                                        title={
                                            isOwn
                                                ? 'No puedes eliminar tu propia cuenta'
                                                : 'Eliminar usuario'
                                        }
                                        style={{
                                            width: '30px',
                                            height: '30px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'transparent',
                                            border: `1px solid ${isOwn ? '#EDF3F4' : '#DCE8EA'}`,
                                            borderRadius: '7px',
                                            cursor: isOwn
                                                ? 'not-allowed'
                                                : 'pointer',
                                        }}
                                    >
                                        <Trash2
                                            size={13}
                                            color={
                                                isOwn ? '#B9C9CC' : '#5E7A80'
                                            }
                                        />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {filtered.length === 0 && (
                        <div
                            style={{
                                padding: '32px 20px',
                                textAlign: 'center',
                                fontSize: '13px',
                                color: '#7E9AA0',
                                borderTop: '1px solid #EFF5F6',
                            }}
                        >
                            Ningún usuario coincide con tu búsqueda.
                        </div>
                    )}

                    {/* Footer */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 20px',
                            borderTop: '1px solid #EFF5F6',
                            flexWrap: 'wrap',
                            gap: '8px',
                        }}
                    >
                        <div style={{ fontSize: '11.5px', color: '#7E9AA0' }}>
                            {users.length} usuarios · {activeCount} activos ·{' '}
                            {invitedCount} invitados
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#7E9AA0' }}>
                            Suspender un usuario conserva su historial pero bloquea el acceso.
                        </div>
                    </div>
                </div>

                {/* Role cards */}
                <div style={{ marginBottom: '8px' }}>
                    <div
                        style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#123238',
                            marginBottom: '14px',
                        }}
                    >
                        Roles de usuario
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                containerW >= 1100
                                    ? 'repeat(5, 1fr)'
                                    : containerW >= 780
                                      ? 'repeat(2, 1fr)'
                                      : '1fr',
                            gap: '12px',
                        }}
                    >
                        {Object.entries(ROLES).map(([key, cfg]) => {
                            const count = roleCounts[key] ?? 0;
                            return (
                                <div
                                    key={key}
                                    style={{
                                        background: '#FFFFFF',
                                        border: '1px solid #E0EBED',
                                        borderRadius: '12px',
                                        padding: '14px 16px',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '7px',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: cfg.color,
                                                flexShrink: 0,
                                            }}
                                        />
                                        <span
                                            style={{
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: '#123238',
                                            }}
                                        >
                                            {cfg.label}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: '12px',
                                                color: '#7E9AA0',
                                                marginLeft: 'auto',
                                            }}
                                        >
                                            {count}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            color: '#5E7A80',
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {cfg.description}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </SettingsLayout>
        </>
    );
}
