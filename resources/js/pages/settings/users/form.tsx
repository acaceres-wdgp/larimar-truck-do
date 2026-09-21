import { Head, router, useForm } from '@inertiajs/react';
import {
    BarChart2,
    FileText,
    LayoutDashboard,
    Route,
    Settings,
    Truck,
    UserCheck,
    Users,
} from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

interface PermissionRow {
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string;
    job_title: string;
    role: string;
    status: string;
    permissions: Record<string, PermissionRow>;
}

interface PageProps {
    user: UserData | null;
    permissions: Record<string, PermissionRow>;
}

const MODULES = [
    'dashboard',
    'trips',
    'trucks',
    'drivers',
    'clients',
    'invoices',
    'reports',
    'settings',
] as const;
type ModuleKey = (typeof MODULES)[number];

const MODULE_ICONS: Record<ModuleKey, ReactNode> = {
    dashboard: <LayoutDashboard size={15} strokeWidth={1.6} />,
    trips: <Route size={15} strokeWidth={1.6} />,
    trucks: <Truck size={15} strokeWidth={1.6} />,
    drivers: <UserCheck size={15} strokeWidth={1.6} />,
    clients: <Users size={15} strokeWidth={1.6} />,
    invoices: <FileText size={15} strokeWidth={1.6} />,
    reports: <BarChart2 size={15} strokeWidth={1.6} />,
    settings: <Settings size={15} strokeWidth={1.6} />,
};

const ROLES = [
    'administrator',
    'operations',
    'dispatcher',
    'accountant',
    'viewer',
    'custom',
] as const;

const ROLE_CONFIG: Record<
    string,
    { color: string; label: string; description: string }
> = {
    administrator: {
        color: '#1a4e57',
        label: 'Administrator',
        description: 'Full access, including users, catalogs and billing.',
    },
    operations: {
        color: '#2E8055',
        label: 'Operations',
        description: 'Runs the board and the fleet. No user management.',
    },
    dispatcher: {
        color: '#B07C2E',
        label: 'Dispatcher',
        description: 'Schedules and updates trips. Read-only elsewhere.',
    },
    accountant: {
        color: '#4A6BB0',
        label: 'Accountant',
        description: 'Invoices, receivables and client billing data.',
    },
    viewer: {
        color: '#8AA4A9',
        label: 'Viewer',
        description: 'Looks, never touches. Good for owners and auditors.',
    },
    custom: {
        color: '#7E9AA0',
        label: 'Custom',
        description: 'Hand-picked permissions.',
    },
};

const ROLE_PRESETS: Record<
    string,
    Record<string, [boolean, boolean, boolean, boolean]>
> = {
    administrator: {
        dashboard: [true, true, true, true],
        trips: [true, true, true, true],
        trucks: [true, true, true, true],
        drivers: [true, true, true, true],
        clients: [true, true, true, true],
        invoices: [true, true, true, true],
        reports: [true, true, true, true],
        settings: [true, true, true, true],
    },
    operations: {
        dashboard: [true, false, false, false],
        trips: [true, true, true, true],
        trucks: [true, true, true, false],
        drivers: [true, true, true, false],
        clients: [true, true, true, false],
        invoices: [true, false, false, false],
        reports: [true, false, false, false],
        settings: [false, false, false, false],
    },
    dispatcher: {
        dashboard: [true, false, false, false],
        trips: [true, true, true, false],
        trucks: [true, false, false, false],
        drivers: [true, false, false, false],
        clients: [true, false, false, false],
        invoices: [false, false, false, false],
        reports: [false, false, false, false],
        settings: [false, false, false, false],
    },
    accountant: {
        dashboard: [true, false, false, false],
        trips: [true, false, false, false],
        trucks: [false, false, false, false],
        drivers: [false, false, false, false],
        clients: [true, true, true, false],
        invoices: [true, true, true, true],
        reports: [true, false, false, false],
        settings: [false, false, false, false],
    },
    viewer: {
        dashboard: [true, false, false, false],
        trips: [true, false, false, false],
        trucks: [true, false, false, false],
        drivers: [true, false, false, false],
        clients: [true, false, false, false],
        invoices: [false, false, false, false],
        reports: [true, false, false, false],
        settings: [false, false, false, false],
    },
};

type PermissionsMap = Record<string, PermissionRow>;

function emptyPermissions(): PermissionsMap {
    const map: PermissionsMap = {};
    MODULES.forEach((m) => {
        map[m] = {
            can_view: false,
            can_create: false,
            can_edit: false,
            can_delete: false,
        };
    });
    return map;
}

function buildInitialPermissions(
    user: UserData | null,
    perms: Record<string, PermissionRow>,
): PermissionsMap {
    const base = emptyPermissions();
    const source = user ? user.permissions : perms;
    Object.entries(source).forEach(([mod, p]) => {
        if (base[mod] !== undefined) {
            base[mod] = { ...p };
        }
    });
    return base;
}

function presetToPermissions(role: string): PermissionsMap {
    const preset = ROLE_PRESETS[role];
    if (!preset) return emptyPermissions();
    const map: PermissionsMap = {};
    MODULES.forEach((m) => {
        const [v, c, e, d] = preset[m] ?? [false, false, false, false];
        map[m] = { can_view: v, can_create: c, can_edit: e, can_delete: d };
    });
    return map;
}

function detectRole(perms: PermissionsMap): string {
    for (const [roleName, preset] of Object.entries(ROLE_PRESETS)) {
        let match = true;
        for (const m of MODULES) {
            const [v, c, e, d] = preset[m] ?? [false, false, false, false];
            const p = perms[m];
            if (
                !p ||
                p.can_view !== v ||
                p.can_create !== c ||
                p.can_edit !== e ||
                p.can_delete !== d
            ) {
                match = false;
                break;
            }
        }
        if (match) return roleName;
    }
    return 'custom';
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}

function countViewableModules(perms: PermissionsMap): number {
    return MODULES.filter((m) => perms[m]?.can_view).length;
}

function hasDeleteAny(perms: PermissionsMap): boolean {
    return MODULES.some((m) => perms[m]?.can_delete);
}

export default function UserForm({ user, permissions: initPerms }: PageProps) {
    const isEdit = !!user;

    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        job_title: user?.job_title ?? '',
        role: user?.role ?? 'viewer',
        status: user?.status ?? 'active',
        permissions: buildInitialPermissions(user, initPerms),
        send_invite: !isEdit,
    });

    // When role card is selected (not custom), fill permissions from preset
    function selectRole(role: string) {
        if (role !== 'custom' && ROLE_PRESETS[role]) {
            const newPerms = presetToPermissions(role);
            form.setData('permissions', newPerms);
        }
        form.setData('role', role);
    }

    function handleCheckbox(
        module: string,
        field: keyof PermissionRow,
        value: boolean,
    ) {
        const current = {
            ...(form.data.permissions[module] ?? {
                can_view: false,
                can_create: false,
                can_edit: false,
                can_delete: false,
            }),
        };

        if (field === 'can_view' && !value) {
            // Disabling view disables all
            current.can_view = false;
            current.can_create = false;
            current.can_edit = false;
            current.can_delete = false;
        } else if (field !== 'can_view' && value) {
            // Enabling create/edit/delete auto-enables view
            current[field] = true;
            current.can_view = true;
        } else {
            current[field] = value;
        }

        const newPerms = { ...form.data.permissions, [module]: current };
        form.setData('permissions', newPerms);

        // Auto-detect role
        const detectedRole = detectRole(newPerms);
        form.setData('role', detectedRole);
    }

    function selectAll() {
        const newPerms: PermissionsMap = {};
        MODULES.forEach((m) => {
            newPerms[m] = {
                can_view: true,
                can_create: true,
                can_edit: true,
                can_delete: true,
            };
        });
        form.setData('permissions', newPerms);
        form.setData('role', detectRole(newPerms));
    }

    function clearAll() {
        const newPerms = emptyPermissions();
        form.setData('permissions', newPerms);
        form.setData('role', detectRole(newPerms));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit) {
            form.put(`/settings/users/${user.id}`);
        } else {
            form.post('/settings/users');
        }
    }

    const viewableCount = countViewableModules(form.data.permissions);
    const canDeleteAny = hasDeleteAny(form.data.permissions);
    const roleConfig = ROLE_CONFIG[form.data.role] ?? ROLE_CONFIG.custom;

    const inputSt: React.CSSProperties = {
        border: '1px solid #DCE8EA',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '13px',
        color: '#123238',
        outline: 'none',
        fontFamily: 'inherit',
        width: '100%',
        boxSizing: 'border-box',
        background: '#FFFFFF',
    };

    const labelSt: React.CSSProperties = {
        fontSize: '12px',
        fontWeight: 500,
        color: '#5E7A80',
        marginBottom: '5px',
        display: 'block',
    };

    const title = isEdit ? `Edit ${user.name}` : 'Invite a user';
    const breadcrumb = `Home / Settings / Users / ${isEdit ? user.name : 'New user'}`;

    return (
        <>
            <Head title={`Settings – ${title}`} />

            {/* Page header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '10px',
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: '12px',
                            color: '#7E9AA0',
                            marginBottom: '4px',
                        }}
                    >
                        {breadcrumb}
                    </div>
                    <h1
                        style={{
                            fontFamily: "'Bitter', Georgia, serif",
                            fontSize: '22px',
                            fontWeight: 600,
                            color: '#123238',
                            margin: 0,
                        }}
                    >
                        {title}
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="button"
                        onClick={() => router.visit('/settings/users')}
                        style={{
                            padding: '8px 18px',
                            background: '#FFFFFF',
                            border: '1px solid #DCE8EA',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#1a4e57',
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={form.processing}
                        style={{
                            padding: '8px 18px',
                            background: form.processing ? '#4a909f' : '#1a4e57',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#FFFFFF',
                            cursor: form.processing ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isEdit ? 'Save changes' : 'Send invitation'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0,1fr) 300px',
                        gap: '24px',
                        alignItems: 'start',
                    }}
                >
                    {/* Left column */}
                    <div>
                        {/* Basic info card */}
                        <div
                            style={{
                                background: '#FFFFFF',
                                border: '1px solid #E0EBED',
                                borderRadius: '14px',
                                padding: '24px',
                                marginBottom: '24px',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#123238',
                                    marginBottom: '18px',
                                }}
                            >
                                Basic info
                            </div>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '16px',
                                }}
                            >
                                <div>
                                    <label style={labelSt}>Full name *</label>
                                    <input
                                        style={inputSt}
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                        placeholder="Jane Doe"
                                    />
                                    {form.errors.name && (
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#B14C3C',
                                                marginTop: '4px',
                                            }}
                                        >
                                            {form.errors.name}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={labelSt}>Email *</label>
                                    <input
                                        style={inputSt}
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) =>
                                            form.setData(
                                                'email',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="jane@company.com"
                                    />
                                    {form.errors.email && (
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#B14C3C',
                                                marginTop: '4px',
                                            }}
                                        >
                                            {form.errors.email}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={labelSt}>Phone</label>
                                    <input
                                        style={inputSt}
                                        value={form.data.phone}
                                        onChange={(e) =>
                                            form.setData(
                                                'phone',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="+1 809 000 0000"
                                    />
                                </div>
                                <div>
                                    <label style={labelSt}>Job title</label>
                                    <input
                                        style={inputSt}
                                        value={form.data.job_title}
                                        onChange={(e) =>
                                            form.setData(
                                                'job_title',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Operations Manager"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Role presets */}
                        <div
                            style={{
                                background: '#FFFFFF',
                                border: '1px solid #E0EBED',
                                borderRadius: '14px',
                                padding: '24px',
                                marginBottom: '24px',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#123238',
                                    marginBottom: '16px',
                                }}
                            >
                                Role
                            </div>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '10px',
                                }}
                            >
                                {ROLES.map((role) => {
                                    const cfg = ROLE_CONFIG[role];
                                    const isSelected = form.data.role === role;
                                    return (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => selectRole(role)}
                                            style={{
                                                padding: '12px 14px',
                                                background: isSelected
                                                    ? '#F4FAFB'
                                                    : '#FFFFFF',
                                                border: `1.5px solid ${isSelected ? '#1a4e57' : '#E0EBED'}`,
                                                borderRadius: '10px',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    marginBottom: '4px',
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
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '11.5px',
                                                    color: '#5E7A80',
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                {cfg.description}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Permission matrix */}
                        <div
                            style={{
                                background: '#FFFFFF',
                                border: '1px solid #E0EBED',
                                borderRadius: '14px',
                                padding: '24px',
                                marginBottom: '24px',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '16px',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#123238',
                                    }}
                                >
                                    Module permissions
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={selectAll}
                                        style={{
                                            padding: '5px 12px',
                                            background: '#FFFFFF',
                                            border: '1px solid #DCE8EA',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            color: '#1a4e57',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Select all
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        style={{
                                            padding: '5px 12px',
                                            background: '#FFFFFF',
                                            border: '1px solid #DCE8EA',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            color: '#5E7A80',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Clear all
                                    </button>
                                </div>
                            </div>

                            {form.errors.permissions && (
                                <div
                                    style={{
                                        padding: '8px 12px',
                                        background: '#FBEAE7',
                                        border: '1px solid #F5C4BC',
                                        borderRadius: '8px',
                                        fontSize: '12.5px',
                                        color: '#8A2A21',
                                        marginBottom: '12px',
                                    }}
                                >
                                    {form.errors.permissions}
                                </div>
                            )}

                            {/* Header row */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                        'minmax(0,1.6fr) 62px 62px 62px 62px',
                                    gap: '0 8px',
                                    padding: '0 12px 8px',
                                    alignItems: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: '#7E9AA0',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    Module
                                </div>
                                {['View', 'Create', 'Edit', 'Delete'].map(
                                    (h) => (
                                        <div
                                            key={h}
                                            style={{
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                color: '#7E9AA0',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                textAlign: 'center',
                                            }}
                                        >
                                            {h}
                                        </div>
                                    ),
                                )}
                            </div>

                            {/* Module rows */}
                            {MODULES.map((mod, idx) => {
                                const p = form.data.permissions[mod] ?? {
                                    can_view: false,
                                    can_create: false,
                                    can_edit: false,
                                    can_delete: false,
                                };
                                const hasSubPermission =
                                    p.can_create || p.can_edit || p.can_delete;
                                const viewLocked = hasSubPermission;
                                const iconColor = p.can_view
                                    ? '#1a4e57'
                                    : '#AFC4C8';

                                return (
                                    <div
                                        key={mod}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns:
                                                'minmax(0,1.6fr) 62px 62px 62px 62px',
                                            gap: '0 8px',
                                            padding: '10px 12px',
                                            alignItems: 'center',
                                            background:
                                                idx % 2 === 0
                                                    ? '#FFFFFF'
                                                    : '#FBFDFD',
                                            borderRadius: '8px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: iconColor,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {MODULE_ICONS[mod]}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: '13px',
                                                    color: '#123238',
                                                    textTransform: 'capitalize',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {mod}
                                            </span>
                                        </div>

                                        {/* View */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <CheckboxCell
                                                checked={p.can_view}
                                                locked={viewLocked}
                                                onChange={(v) =>
                                                    handleCheckbox(
                                                        mod,
                                                        'can_view',
                                                        v,
                                                    )
                                                }
                                            />
                                        </div>

                                        {/* Create */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <CheckboxCell
                                                checked={p.can_create}
                                                onChange={(v) =>
                                                    handleCheckbox(
                                                        mod,
                                                        'can_create',
                                                        v,
                                                    )
                                                }
                                            />
                                        </div>

                                        {/* Edit */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <CheckboxCell
                                                checked={p.can_edit}
                                                onChange={(v) =>
                                                    handleCheckbox(
                                                        mod,
                                                        'can_edit',
                                                        v,
                                                    )
                                                }
                                            />
                                        </div>

                                        {/* Delete */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <CheckboxCell
                                                checked={p.can_delete}
                                                onChange={(v) =>
                                                    handleCheckbox(
                                                        mod,
                                                        'can_delete',
                                                        v,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div>
                        {/* Live summary */}
                        <div
                            style={{
                                background: '#FFFFFF',
                                border: '1px solid #E0EBED',
                                borderRadius: '14px',
                                padding: '20px',
                                marginBottom: '16px',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '14px',
                                }}
                            >
                                <div
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: roleConfig.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: '#FFFFFF',
                                        flexShrink: 0,
                                    }}
                                >
                                    {getInitials(form.data.name || 'New user')}
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: '13.5px',
                                            fontWeight: 600,
                                            color: '#123238',
                                        }}
                                    >
                                        {form.data.name || 'New user'}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            color: '#5E7A80',
                                        }}
                                    >
                                        {form.data.email || 'no email yet'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        color: roleConfig.color,
                                        background: `${roleConfig.color}18`,
                                        padding: '3px 9px',
                                        borderRadius: '20px',
                                    }}
                                >
                                    <span
                                        style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: roleConfig.color,
                                        }}
                                    />
                                    {roleConfig.label}
                                </span>
                            </div>

                            <div
                                style={{
                                    fontSize: '12.5px',
                                    color: '#5E7A80',
                                    marginBottom: '4px',
                                }}
                            >
                                Modules allowed:{' '}
                                <strong style={{ color: '#123238' }}>
                                    {viewableCount} of 8
                                </strong>
                            </div>
                            <div
                                style={{ fontSize: '12.5px', color: '#5E7A80' }}
                            >
                                Can delete records:{' '}
                                <strong
                                    style={{
                                        color: canDeleteAny
                                            ? '#B14C3C'
                                            : '#123238',
                                    }}
                                >
                                    {canDeleteAny ? 'Yes' : 'No'}
                                </strong>
                            </div>
                        </div>

                        {/* Account status */}
                        <div
                            style={{
                                background: '#FFFFFF',
                                border: '1px solid #E0EBED',
                                borderRadius: '14px',
                                padding: '20px',
                                marginBottom: '16px',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: '#123238',
                                    marginBottom: '12px',
                                }}
                            >
                                Account status
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['active', 'suspended'].map((s) => {
                                    const isSelected = form.data.status === s;
                                    return (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() =>
                                                form.setData('status', s)
                                            }
                                            style={{
                                                flex: 1,
                                                padding: '7px 0',
                                                background: isSelected
                                                    ? '#1a4e57'
                                                    : '#FFFFFF',
                                                border: `1px solid ${isSelected ? '#1a4e57' : '#DCE8EA'}`,
                                                borderRadius: '8px',
                                                fontSize: '12.5px',
                                                fontWeight: isSelected
                                                    ? 600
                                                    : 400,
                                                color: isSelected
                                                    ? '#FFFFFF'
                                                    : '#5E7A80',
                                                cursor: 'pointer',
                                                textTransform: 'capitalize',
                                            }}
                                        >
                                            {s}
                                        </button>
                                    );
                                })}
                            </div>

                            {!isEdit && (
                                <label
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '8px',
                                        marginTop: '14px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.data.send_invite}
                                        onChange={(e) =>
                                            form.setData(
                                                'send_invite',
                                                e.target.checked,
                                            )
                                        }
                                        style={{
                                            marginTop: '2px',
                                            cursor: 'pointer',
                                        }}
                                    />
                                    <span
                                        style={{
                                            fontSize: '12.5px',
                                            color: '#3D5F66',
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        Email an invitation so they can set
                                        their own password.
                                    </span>
                                </label>
                            )}

                            {/* Validation errors */}
                            {(form.errors.general ||
                                form.errors.role ||
                                form.errors.status) && (
                                <div
                                    style={{
                                        marginTop: '12px',
                                        padding: '8px 12px',
                                        background: '#FBEAE7',
                                        border: '1px solid #F5C4BC',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        color: '#8A2A21',
                                    }}
                                >
                                    {form.errors.general ||
                                        form.errors.role ||
                                        form.errors.status}
                                </div>
                            )}
                        </div>

                        {/* Info block */}
                        <div
                            style={{
                                background: '#F4FAFB',
                                border: '1px solid #DCE8EA',
                                borderRadius: '12px',
                                padding: '14px 16px',
                                fontSize: '12px',
                                color: '#3D5F66',
                                lineHeight: 1.5,
                            }}
                        >
                            <strong>View is required</strong> — granting create,
                            edit or delete turns it on automatically.
                            <br />
                            <br />
                            <strong>Settings access</strong> lets a user manage
                            catalogs and other users.
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

function CheckboxCell({
    checked,
    locked = false,
    onChange,
}: {
    checked: boolean;
    locked?: boolean;
    onChange: (v: boolean) => void;
}) {
    function handleClick() {
        if (locked && checked) {
            // View locked — do nothing (locked means can't uncheck)
            return;
        }
        onChange(!checked);
    }

    return (
        <div
            onClick={handleClick}
            title={
                locked
                    ? 'View stays on while create, edit or delete are granted'
                    : undefined
            }
            style={{
                width: '22px',
                height: '22px',
                borderRadius: '6px',
                border: `1.5px solid ${locked && checked ? 'transparent' : checked ? '#1a4e57' : '#DCE8EA'}`,
                background:
                    locked && checked
                        ? '#4a909f'
                        : checked
                          ? '#1a4e57'
                          : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: locked && checked ? 'not-allowed' : 'pointer',
                flexShrink: 0,
            }}
        >
            {checked && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                        d="M2 6l3 3 5-5"
                        stroke="#FFFFFF"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </div>
    );
}
