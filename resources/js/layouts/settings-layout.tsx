import { Link, usePage } from '@inertiajs/react';
import { LibraryBig, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

interface SettingsLayoutProps {
    children: ReactNode;
    ctaLabel?: string;
    onCta?: () => void;
}

const TABS = [
    {
        label: 'Catalogs',
        href: '/settings/catalogs',
        segment: 'catalogs',
        Icon: LibraryBig,
    },
    {
        label: 'Users & permissions',
        href: '/settings/users',
        segment: 'users',
        Icon: ShieldCheck,
    },
];

export default function SettingsLayout({
    children,
    ctaLabel,
    onCta,
}: SettingsLayoutProps) {
    const page = usePage();
    const component = page.component as string; // e.g. "settings/users/index"

    // Determine active tab from component path
    const activeSegment = component.split('/')[1] ?? '';
    const activeTab = TABS.find((t) => t.segment === activeSegment) ?? TABS[0];

    return (
        <>
            {/* Page header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0',
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
                        Home / Settings / {activeTab.label}
                    </div>
                    <h1
                        style={{
                            fontFamily: "'Bitter', Georgia, serif",
                            fontSize: '25px',
                            fontWeight: 600,
                            color: '#123238',
                            margin: 0,
                        }}
                    >
                        Settings
                    </h1>
                </div>
                {ctaLabel && onCta && (
                    <button
                        onClick={onCta}
                        style={{
                            padding: '9px 18px',
                            background: '#1a4e57',
                            border: 'none',
                            borderRadius: '9px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#FFFFFF',
                            cursor: 'pointer',
                        }}
                    >
                        {ctaLabel}
                    </button>
                )}
            </div>

            {/* Tab row */}
            <div
                style={{
                    display: 'flex',
                    gap: '0',
                    borderBottom: '1px solid #E0EBED',
                    marginTop: '16px',
                    marginBottom: '24px',
                }}
            >
                {TABS.map(({ label, href, segment, Icon }) => {
                    const isActive = segment === activeSegment;
                    return (
                        <Link
                            key={segment}
                            href={href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 16px',
                                fontSize: '13.5px',
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? '#123238' : '#5E7A80',
                                textDecoration: 'none',
                                borderBottom: isActive
                                    ? '2px solid #1a4e57'
                                    : '2px solid transparent',
                                marginBottom: '-1px',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <Icon size={15} strokeWidth={1.6} />
                            {label}
                        </Link>
                    );
                })}
            </div>

            {children}
        </>
    );
}
