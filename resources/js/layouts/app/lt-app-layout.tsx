import { Link, router, usePage } from '@inertiajs/react';
import {
    Banknote,
    Bell,
    Building2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    LayoutDashboard,
    LogOut,
    Menu,
    Receipt,
    Route,
    Search,
    Settings,
    TrendingUp,
    Truck,
    Users,
    X,
} from 'lucide-react';
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import type { Auth } from '@/types';

interface LtAppLayoutProps {
    children: ReactNode;
    breadcrumbs?: { title: string; href?: string }[];
}

interface NavItem {
    key: string;
    label: string;
    href: string;
    module?: string;
    Icon: React.ComponentType<{
        size?: number;
        strokeWidth?: number;
        color?: string;
    }>;
}

const NAV_ITEMS: NavItem[] = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        module: 'dashboard',
        Icon: LayoutDashboard,
    },
    {
        key: 'operations',
        label: 'Operations',
        href: '/operations',
        module: 'trips',
        Icon: Route,
    },
    {
        key: 'orders',
        label: 'Orders',
        href: '/orders',
        module: 'trips',
        Icon: ClipboardList,
    },
    {
        key: 'clients',
        label: 'Clients',
        href: '/clients',
        module: 'clients',
        Icon: Building2,
    },
    {
        key: 'trucks',
        label: 'Trucks',
        href: '/trucks',
        module: 'trucks',
        Icon: Truck,
    },
    {
        key: 'drivers',
        label: 'Drivers',
        href: '/drivers',
        module: 'drivers',
        Icon: Users,
    },
    {
        key: 'invoices',
        label: 'Invoices',
        href: '/invoices',
        module: 'invoices',
        Icon: Receipt,
    },
    {
        key: 'payroll',
        label: 'Payroll',
        href: '/payroll',
        module: 'payroll',
        Icon: Banknote,
    },
    {
        key: 'reports',
        label: 'Reports',
        href: '/reports',
        module: 'reports',
        Icon: TrendingUp,
    },
    {
        key: 'settings',
        label: 'Settings',
        href: '/settings/catalogs',
        module: 'settings',
        Icon: Settings,
    },
];

const MONTHS_LONG = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
const DAYS_LONG = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];
const MONTHS_SHORT = [
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

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
}

function formatTimeClock(d: Date): string {
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
}

function formatDateShort(d: Date): string {
    return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function formatDateLong(d: Date): string {
    return `${DAYS_LONG[d.getDay()]}, ${MONTHS_LONG[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}

function getFirstName(name: string): string {
    return name.trim().split(/\s+/)[0];
}

export default function LtAppLayout({
    children,
    breadcrumbs = [],
}: LtAppLayoutProps) {
    const page = usePage();
    const { auth } = page.props as { auth: Auth };
    const component = page.component as string; // e.g. "dashboard"
    const currentKey = component.split('/')[0]?.toLowerCase() ?? '';

    const [collapsed, setCollapsed] = useState<boolean>(() => {
        try {
            return localStorage.getItem('lt-sidebar-collapsed') === '1';
        } catch {
            return false;
        }
    });
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [userDropOpen, setUserDropOpen] = useState(false);
    const [now, setNow] = useState(new Date());
    const [isCompact, setIsCompact] = useState(false);
    const [hasDateBar, setHasDateBar] = useState(false);
    const [hasSearch, setHasSearch] = useState(false);
    const [hoverUpgrade, setHoverUpgrade] = useState(false);
    const [hoverNewTrip, setHoverNewTrip] = useState(false);
    const [hoverExport, setHoverExport] = useState(false);

    const dropRef = useRef<HTMLDivElement>(null);

    // Tick clock every second
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Responsive
    useEffect(() => {
        function measure() {
            const w = window.innerWidth;
            setIsMobile(w < 900);
            setIsCompact(w < 1100);
            setHasDateBar(w >= 780);
            setHasSearch(w >= 1100);
            if (w < 900) setCollapsed(false);
        }
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    // Close drawer on navigate
    useEffect(() => {
        setDrawerOpen(false);
    }, [component]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                dropRef.current &&
                !dropRef.current.contains(e.target as Node)
            ) {
                setUserDropOpen(false);
            }
        }
        if (userDropOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [userDropOpen]);

    const toggleCollapse = useCallback(() => {
        if (isMobile) {
            setDrawerOpen(false);
            return;
        }
        setCollapsed((v) => {
            const next = !v;
            try {
                localStorage.setItem('lt-sidebar-collapsed', next ? '1' : '0');
            } catch {
                /* ignore */
            }
            return next;
        });
    }, [isMobile]);

    const user = auth?.user;
    const userName = user?.name ?? 'User';
    const userEmail = user?.email ?? '';
    const initials = getInitials(userName);
    const firstName = getFirstName(userName);
    const permissions = (user as any)?.permissions as
        | Record<string, { can_view: boolean }>
        | undefined;

    const visibleNavItems = NAV_ITEMS.filter((item) => {
        if (!item.module) return true;
        if (!permissions) return true;
        const perm = permissions[item.module];
        if (perm === undefined) return true; // no restriction if no permission row yet
        return perm.can_view !== false;
    });

    const sidebarWidth = collapsed && !isMobile ? 68 : 248;

    // Section title from nav items
    const activeItem = NAV_ITEMS.find((n) => n.key === currentKey);
    const sectionTitle = activeItem?.label ?? 'Dashboard';

    function Sidebar({ inDrawer = false }: { inDrawer?: boolean }) {
        const effectiveCollapsed = inDrawer ? false : collapsed;
        return (
            <div
                style={{
                    width: effectiveCollapsed ? 68 : 248,
                    minWidth: effectiveCollapsed ? 68 : 248,
                    background: '#1a4e57',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    transition: 'width 0.22s ease, min-width 0.22s ease',
                    overflow: 'hidden',
                }}
            >
                {/* Logo area */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: effectiveCollapsed ? '22px 0' : '22px 20px',
                        justifyContent: effectiveCollapsed
                            ? 'center'
                            : 'flex-start',
                        minHeight: '72px',
                        borderBottom: '1px solid rgba(148,213,221,0.1)',
                    }}
                >
                    <img
                        src="/images/mark-larimar-white.png"
                        alt=""
                        style={{
                            height: '28px',
                            width: '28px',
                            objectFit: 'contain',
                            flexShrink: 0,
                        }}
                    />
                    {!effectiveCollapsed && (
                        <div>
                            <div
                                style={{
                                    fontFamily: "'Bitter', Georgia, serif",
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    color: '#FFFFFF',
                                    lineHeight: 1.2,
                                }}
                            >
                                LarimarTruck
                            </div>
                            <div
                                style={{
                                    fontSize: '11px',
                                    color: '#a4dcde',
                                    lineHeight: 1.2,
                                    marginTop: '1px',
                                }}
                            >
                                by Larimar.dev
                            </div>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav
                    style={{
                        flex: 1,
                        padding: effectiveCollapsed ? '12px 8px' : '12px 10px',
                        overflowY: 'auto',
                    }}
                >
                    {visibleNavItems.map(({ key, label, href, Icon }) => {
                        const isActive = key === currentKey;
                        return (
                            <Link
                                key={key}
                                href={href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: effectiveCollapsed ? 0 : '10px',
                                    justifyContent: effectiveCollapsed
                                        ? 'center'
                                        : 'flex-start',
                                    padding: effectiveCollapsed
                                        ? '10px 0'
                                        : '8px 12px',
                                    marginBottom: '2px',
                                    borderRadius: effectiveCollapsed
                                        ? '8px'
                                        : '8px',
                                    textDecoration: 'none',
                                    background:
                                        isActive && !effectiveCollapsed
                                            ? 'rgba(185,247,252,0.13)'
                                            : 'transparent',
                                    borderLeft:
                                        isActive && !effectiveCollapsed
                                            ? '3px solid #94d5dd'
                                            : '3px solid transparent',
                                    transition: 'background 0.12s',
                                }}
                            >
                                {effectiveCollapsed ? (
                                    <span
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: isActive
                                                ? '#94d5dd'
                                                : 'transparent',
                                        }}
                                    >
                                        <Icon
                                            size={18}
                                            strokeWidth={1.5}
                                            color={
                                                isActive
                                                    ? '#123238'
                                                    : 'rgba(255,255,255,0.65)'
                                            }
                                        />
                                    </span>
                                ) : (
                                    <>
                                        <Icon
                                            size={18}
                                            strokeWidth={1.5}
                                            color={
                                                isActive
                                                    ? '#b9f7fc'
                                                    : 'rgba(255,255,255,0.6)'
                                            }
                                        />
                                        <span
                                            style={{
                                                fontSize: '13.5px',
                                                fontWeight: isActive
                                                    ? 500
                                                    : 400,
                                                color: isActive
                                                    ? '#FFFFFF'
                                                    : 'rgba(255,255,255,0.72)',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {label}
                                        </span>
                                    </>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div
                    style={{
                        padding: effectiveCollapsed ? '12px 8px' : '12px 10px',
                        borderTop: '1px solid rgba(148,213,221,0.1)',
                    }}
                >
                    {/* Trial card */}
                    {!effectiveCollapsed && (
                        <div
                            style={{
                                background: 'rgba(164,220,222,0.12)',
                                border: '1px solid rgba(164,220,222,0.22)',
                                borderRadius: '10px',
                                padding: '12px 14px',
                                marginBottom: '10px',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '12px',
                                    color: '#a4dcde',
                                    marginBottom: '4px',
                                    fontWeight: 500,
                                }}
                            >
                                Trial · 9 days left
                            </div>
                            <div
                                style={{
                                    fontSize: '11.5px',
                                    color: 'rgba(164,220,222,0.7)',
                                    marginBottom: '10px',
                                    lineHeight: 1.4,
                                }}
                            >
                                Up to 5 trucks on the free plan.
                            </div>
                            <button
                                onMouseEnter={() => setHoverUpgrade(true)}
                                onMouseLeave={() => setHoverUpgrade(false)}
                                style={{
                                    width: '100%',
                                    padding: '6px 0',
                                    background: hoverUpgrade
                                        ? '#b9f7fc'
                                        : '#94d5dd',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#123238',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                            >
                                Upgrade plan
                            </button>
                        </div>
                    )}

                    {/* Collapse/expand button */}
                    <button
                        onClick={toggleCollapse}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: effectiveCollapsed
                                ? 'center'
                                : 'flex-start',
                            gap: '8px',
                            background: 'rgba(148,213,221,0.08)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            cursor: 'pointer',
                            color: 'rgba(255,255,255,0.55)',
                            fontSize: '12px',
                        }}
                    >
                        {inDrawer ? (
                            <X size={16} strokeWidth={1.5} />
                        ) : effectiveCollapsed ? (
                            <ChevronRight size={16} strokeWidth={1.5} />
                        ) : (
                            <>
                                <ChevronLeft size={16} strokeWidth={1.5} />
                                <span>Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                minHeight: '100dvh',
                background: '#F2F7F8',
                fontFamily: "'Roboto', sans-serif",
            }}
        >
            {/* Desktop sidebar */}
            {!isMobile && (
                <div
                    style={{
                        position: 'sticky',
                        top: 0,
                        height: '100dvh',
                        flexShrink: 0,
                        transition: 'width 0.22s ease',
                        width: sidebarWidth,
                    }}
                >
                    <Sidebar />
                </div>
            )}

            {/* Mobile drawer */}
            {isMobile && drawerOpen && (
                <>
                    {/* Scrim */}
                    <div
                        onClick={() => setDrawerOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(18,50,56,0.45)',
                            zIndex: 40,
                        }}
                    />
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '248px',
                            height: '100dvh',
                            zIndex: 50,
                        }}
                    >
                        <Sidebar inDrawer />
                    </div>
                </>
            )}

            {/* Main area */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                }}
            >
                {/* Header */}
                <header
                    style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 30,
                        background: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        borderBottom: '1px solid #E0EBED',
                        minHeight: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 24px',
                        gap: '12px',
                    }}
                >
                    {/* Hamburger (mobile) */}
                    {isMobile && (
                        <button
                            onClick={() => setDrawerOpen(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                background: '#FFFFFF',
                                border: '1px solid #DCE8EA',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                flexShrink: 0,
                            }}
                        >
                            <Menu size={18} strokeWidth={1.5} color="#1a4e57" />
                        </button>
                    )}

                    {/* Section title + date */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{
                                fontFamily: "'Bitter', Georgia, serif",
                                fontWeight: 600,
                                fontSize: '18px',
                                color: '#123238',
                                lineHeight: 1.2,
                            }}
                        >
                            {sectionTitle}
                        </div>
                        {!isMobile && (
                            <div
                                style={{
                                    fontSize: '12px',
                                    color: '#5E7A80',
                                    marginTop: '1px',
                                }}
                            >
                                {formatDateLong(now)}
                            </div>
                        )}
                    </div>

                    {/* Search bar */}
                    {hasSearch && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#F2F7F8',
                                border: '1px solid #E0EBED',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                width: '220px',
                            }}
                        >
                            <Search
                                size={15}
                                strokeWidth={1.5}
                                color="#9DB3B8"
                            />
                            <input
                                type="text"
                                placeholder="Search…"
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    outline: 'none',
                                    fontSize: '13px',
                                    color: '#123238',
                                    width: '100%',
                                }}
                            />
                        </div>
                    )}

                    {/* Right cluster */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexShrink: 0,
                        }}
                    >
                        {/* Clock + date */}
                        {hasDateBar && (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    paddingRight: '10px',
                                    borderRight: '1px solid #E0EBED',
                                    marginRight: '2px',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        color: '#123238',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {formatTimeClock(now)}
                                </span>
                                <span
                                    style={{
                                        fontSize: '11px',
                                        color: '#5E7A80',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {formatDateShort(now)}
                                </span>
                            </div>
                        )}

                        {/* Bell */}
                        <button
                            style={{
                                position: 'relative',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Bell size={18} strokeWidth={1.5} color="#5E7A80" />
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    width: '7px',
                                    height: '7px',
                                    borderRadius: '50%',
                                    background: '#4a909f',
                                    border: '1.5px solid #FFFFFF',
                                }}
                            />
                        </button>

                        {/* User chip */}
                        <div ref={dropRef} style={{ position: 'relative' }}>
                            <button
                                onClick={() => setUserDropOpen((v) => !v)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'none',
                                    border: '1px solid #E0EBED',
                                    borderRadius: '100px',
                                    padding: '5px 10px 5px 5px',
                                    cursor: 'pointer',
                                }}
                            >
                                <span
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: '#4a909f',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: '#FFFFFF',
                                        flexShrink: 0,
                                    }}
                                >
                                    {initials}
                                </span>
                                {!isCompact && (
                                    <span
                                        style={{
                                            fontSize: '13px',
                                            color: '#123238',
                                            fontWeight: 500,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {firstName}
                                    </span>
                                )}
                                <ChevronDown
                                    size={14}
                                    strokeWidth={1.5}
                                    color="#5E7A80"
                                />
                            </button>

                            {/* Dropdown */}
                            {userDropOpen && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 8px)',
                                        right: 0,
                                        background: '#FFFFFF',
                                        border: '1px solid #E0EBED',
                                        borderRadius: '12px',
                                        boxShadow:
                                            '0 8px 24px rgba(18,50,56,0.12)',
                                        width: '220px',
                                        zIndex: 50,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: '14px 16px 10px',
                                            borderBottom: '1px solid #EFF5F6',
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: '#123238',
                                            }}
                                        >
                                            {userName}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#5E7A80',
                                                marginTop: '2px',
                                                wordBreak: 'break-all',
                                            }}
                                        >
                                            {userEmail}
                                        </div>
                                    </div>
                                    <div style={{ padding: '6px 8px' }}>
                                        {[
                                            {
                                                label: 'Profile',
                                                href: '/settings/profile',
                                            },
                                            {
                                                label: 'Company settings',
                                                href: '/settings',
                                            },
                                        ].map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                style={{
                                                    display: 'block',
                                                    padding: '8px 10px',
                                                    fontSize: '13px',
                                                    color: '#3D5F66',
                                                    textDecoration: 'none',
                                                    borderRadius: '7px',
                                                }}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                        <button
                                            onClick={() =>
                                                router.post('/logout')
                                            }
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                width: '100%',
                                                padding: '8px 10px',
                                                fontSize: '13px',
                                                color: '#B14C3C',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                borderRadius: '7px',
                                                textAlign: 'left',
                                                marginTop: '2px',
                                            }}
                                        >
                                            <LogOut
                                                size={14}
                                                strokeWidth={1.5}
                                            />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content area */}
                <main
                    style={{
                        flex: 1,
                        padding: isCompact
                            ? '20px 18px 40px'
                            : '26px 28px 48px',
                    }}
                >
                    {/* Breadcrumb */}
                    {breadcrumbs.length > 0 && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginBottom: '14px',
                            }}
                        >
                            {breadcrumbs.map((b, i) => (
                                <span
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}
                                >
                                    {i > 0 && (
                                        <span
                                            style={{
                                                color: '#9DB3B8',
                                                fontSize: '12px',
                                            }}
                                        >
                                            /
                                        </span>
                                    )}
                                    {b.href ? (
                                        <Link
                                            href={b.href}
                                            style={{
                                                fontSize: '12px',
                                                color: '#5E7A80',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            {b.title}
                                        </Link>
                                    ) : (
                                        <span
                                            style={{
                                                fontSize: '12px',
                                                color: '#9DB3B8',
                                            }}
                                        >
                                            {b.title}
                                        </span>
                                    )}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Greeting + actions bar */}
                    {(currentKey === 'dashboard' ||
                        currentKey === 'operations') && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                marginBottom: '24px',
                                gap: '12px',
                                flexWrap: 'wrap',
                            }}
                        >
                            <div>
                                <h1
                                    style={{
                                        fontFamily: "'Bitter', Georgia, serif",
                                        fontWeight: 600,
                                        fontSize: isCompact ? '20px' : '24px',
                                        color: '#123238',
                                        margin: 0,
                                    }}
                                >
                                    {getGreeting()}, {firstName}
                                </h1>
                            </div>
                            {currentKey === 'operations' && (
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '10px',
                                        flexShrink: 0,
                                    }}
                                >
                                    <button
                                        onMouseEnter={() =>
                                            setHoverExport(true)
                                        }
                                        onMouseLeave={() =>
                                            setHoverExport(false)
                                        }
                                        style={{
                                            padding: '8px 16px',
                                            background: hoverExport
                                                ? '#EDF3F4'
                                                : '#FFFFFF',
                                            border: '1px solid #DCE8EA',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            color: '#1a4e57',
                                            cursor: 'pointer',
                                            transition: 'background 0.12s',
                                        }}
                                    >
                                        Export
                                    </button>
                                    <button
                                        onClick={() =>
                                            router.get('/trips/create')
                                        }
                                        onMouseEnter={() =>
                                            setHoverNewTrip(true)
                                        }
                                        onMouseLeave={() =>
                                            setHoverNewTrip(false)
                                        }
                                        style={{
                                            padding: '8px 16px',
                                            background: hoverNewTrip
                                                ? '#123238'
                                                : '#1a4e57',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            color: '#FFFFFF',
                                            cursor: 'pointer',
                                            transition: 'background 0.12s',
                                        }}
                                    >
                                        New trip
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}
