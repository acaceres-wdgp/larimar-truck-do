import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { store } from '@/routes/login';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [remember, setRemember] = useState(false);
    const [hoverSignIn, setHoverSignIn] = useState(false);

    return (
        <>
            <Head title="Iniciar sesión" />
            <div
                style={{
                    display: 'flex',
                    minHeight: '100dvh',
                    fontFamily: "'Roboto', sans-serif",
                }}
            >
                {/* Left panel — hidden below 980px */}
                <div
                    style={{
                        display: 'none',
                        background: '#1a4e57',
                        position: 'relative',
                        overflow: 'hidden',
                        flex: '0 0 480px',
                        maxWidth: '520px',
                    }}
                    className="lt-login-left"
                >
                    {/* Decorative shapes */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-90px',
                            right: '-90px',
                            width: '340px',
                            height: '340px',
                            borderRadius: '50%',
                            background: 'rgba(74,144,159,0.18)',
                            pointerEvents: 'none',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '120px',
                            left: '-70px',
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            border: '2px solid rgba(148,213,221,0.25)',
                            background: 'transparent',
                            pointerEvents: 'none',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '200px',
                            right: '40px',
                            width: '80px',
                            height: '80px',
                            background: 'rgba(148,213,221,0.12)',
                            transform: 'rotate(30deg)',
                            borderRadius: '10px',
                            pointerEvents: 'none',
                        }}
                    />

                    {/* Content */}
                    <div
                        style={{
                            position: 'relative',
                            zIndex: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%',
                            padding: '48px 44px 44px',
                        }}
                    >
                        {/* Top: logo + pill + headline */}
                        <div>
                            <img
                                src="/images/logo-larimar-white.png"
                                alt="LarimarTruck"
                                style={{ height: '36px', marginBottom: '40px' }}
                            />

                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    background: 'rgba(148,213,221,0.15)',
                                    border: '1px solid rgba(148,213,221,0.3)',
                                    borderRadius: '100px',
                                    padding: '4px 14px',
                                    fontSize: '12px',
                                    color: '#94d5dd',
                                    letterSpacing: '0.04em',
                                    marginBottom: '24px',
                                }}
                            >
                                Gestión de flota
                            </div>

                            <h1
                                style={{
                                    fontFamily: "'Bitter', Georgia, serif",
                                    fontWeight: 600,
                                    fontSize: '32px',
                                    lineHeight: '1.25',
                                    color: '#FFFFFF',
                                    margin: '0 0 20px',
                                    maxWidth: '380px',
                                }}
                            >
                                Cada viaje, camión y factura en un solo lugar.
                            </h1>

                            <p
                                style={{
                                    fontSize: '15px',
                                    lineHeight: '1.6',
                                    color: '#a4dcde',
                                    maxWidth: '360px',
                                    margin: 0,
                                }}
                            >
                                LarimarTruck centraliza tu despacho, flota y
                                facturación — para que dediques menos tiempo a
                                hojas de cálculo y más a hacer crecer tu operación.
                            </p>
                        </div>

                        {/* Bottom metrics */}
                        <div
                            style={{
                                display: 'flex',
                                gap: '0',
                                borderTop: '1px solid rgba(148,213,221,0.18)',
                                paddingTop: '32px',
                            }}
                        >
                            {[
                                { value: '2,400+', label: 'viajes despachados' },
                                { value: '18 min', label: 'configuración promedio' },
                                { value: 'RD$', label: 'facturación integrada' },
                            ].map((m, i) => (
                                <div
                                    key={i}
                                    style={{
                                        flex: 1,
                                        paddingRight: i < 2 ? '24px' : 0,
                                        borderRight:
                                            i < 2
                                                ? '1px solid rgba(148,213,221,0.15)'
                                                : 'none',
                                        marginRight: i < 2 ? '24px' : 0,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Bitter', Georgia, serif",
                                            fontWeight: 700,
                                            fontSize: '24px',
                                            color: '#b9f7fc',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        {m.value}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            color: '#a4dcde',
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {m.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right panel */}
                <div
                    style={{
                        flex: 1,
                        background: '#F2F7F8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 24px',
                        minHeight: '100dvh',
                    }}
                >
                    <div style={{ width: '100%', maxWidth: '400px' }}>
                        {/* Logo mark */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '36px',
                            }}
                        >
                            <img
                                src="/images/mark-larimar.png"
                                alt=""
                                style={{
                                    height: '32px',
                                    width: '32px',
                                    objectFit: 'contain',
                                }}
                            />
                            <span
                                style={{
                                    fontFamily: "'Bitter', Georgia, serif",
                                    fontWeight: 600,
                                    fontSize: '20px',
                                    color: '#123238',
                                }}
                            >
                                LarimarTruck
                            </span>
                        </div>

                        {/* Heading */}
                        <h2
                            style={{
                                fontFamily: "'Bitter', Georgia, serif",
                                fontWeight: 600,
                                fontSize: '26px',
                                color: '#123238',
                                margin: '0 0 6px',
                            }}
                        >
                            Bienvenido de nuevo
                        </h2>
                        <p
                            style={{
                                fontSize: '14px',
                                color: '#5E7A80',
                                margin: '0 0 28px',
                            }}
                        >
                            Inicia sesión en tu cuenta de despacho.
                        </p>

                        {/* Card */}
                        <div
                            style={{
                                background: '#FFFFFF',
                                border: '1px solid #E0EBED',
                                borderRadius: '14px',
                                padding: '28px 28px 24px',
                                marginBottom: '20px',
                            }}
                        >
                            <Form
                                {...store.form()}
                                resetOnSuccess={['password']}
                            >
                                {({ processing, errors }) => (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '18px',
                                        }}
                                    >
                                        {/* Global error */}
                                        {(errors.email ?? errors.password) && (
                                            <div
                                                style={{
                                                    background: '#FEF2F2',
                                                    border: '1px solid #FECACA',
                                                    borderRadius: '8px',
                                                    padding: '10px 14px',
                                                    fontSize: '13px',
                                                    color: '#B91C1C',
                                                }}
                                            >
                                                {errors.email ??
                                                    errors.password}
                                            </div>
                                        )}

                                        {status && (
                                            <div
                                                style={{
                                                    background: '#F0FDF4',
                                                    border: '1px solid #BBF7D0',
                                                    borderRadius: '8px',
                                                    padding: '10px 14px',
                                                    fontSize: '13px',
                                                    color: '#15803D',
                                                }}
                                            >
                                                {status}
                                            </div>
                                        )}

                                        {/* Email */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '6px',
                                            }}
                                        >
                                            <label
                                                htmlFor="email"
                                                style={{
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                    color: '#3D5F66',
                                                }}
                                            >
                                                Correo electrónico
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="you@company.com"
                                                onFocus={() =>
                                                    setEmailFocused(true)
                                                }
                                                onBlur={() =>
                                                    setEmailFocused(false)
                                                }
                                                style={{
                                                    width: '100%',
                                                    padding: '9px 12px',
                                                    fontSize: '14px',
                                                    background: emailFocused
                                                        ? '#FFFFFF'
                                                        : '#F8FBFB',
                                                    border: `1px solid ${emailFocused ? '#4a909f' : '#DCE8EA'}`,
                                                    borderRadius: '8px',
                                                    outline: 'none',
                                                    color: '#123238',
                                                    transition:
                                                        'border-color 0.15s, background 0.15s',
                                                    boxSizing: 'border-box',
                                                }}
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        {/* Password */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '6px',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent:
                                                        'space-between',
                                                }}
                                            >
                                                <label
                                                    htmlFor="password"
                                                    style={{
                                                        fontSize: '13px',
                                                        fontWeight: 500,
                                                        color: '#3D5F66',
                                                    }}
                                                >
                                                    Contraseña
                                                </label>
                                                <a
                                                    href="/forgot-password"
                                                    tabIndex={5}
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#4a909f',
                                                        textDecoration: 'none',
                                                    }}
                                                >
                                                    ¿Olvidaste tu contraseña?
                                                </a>
                                            </div>
                                            <div
                                                style={{ position: 'relative' }}
                                            >
                                                <input
                                                    id="password"
                                                    type={
                                                        showPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    name="password"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="current-password"
                                                    placeholder="••••••••"
                                                    onFocus={() =>
                                                        setPasswordFocused(true)
                                                    }
                                                    onBlur={() =>
                                                        setPasswordFocused(
                                                            false,
                                                        )
                                                    }
                                                    style={{
                                                        width: '100%',
                                                        padding:
                                                            '9px 40px 9px 12px',
                                                        fontSize: '14px',
                                                        background:
                                                            passwordFocused
                                                                ? '#FFFFFF'
                                                                : '#F8FBFB',
                                                        border: `1px solid ${passwordFocused ? '#4a909f' : '#DCE8EA'}`,
                                                        borderRadius: '8px',
                                                        outline: 'none',
                                                        color: '#123238',
                                                        transition:
                                                            'border-color 0.15s, background 0.15s',
                                                        boxSizing: 'border-box',
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    tabIndex={-1}
                                                    onClick={() =>
                                                        setShowPassword(
                                                            (v) => !v,
                                                        )
                                                    }
                                                    style={{
                                                        position: 'absolute',
                                                        right: '10px',
                                                        top: '50%',
                                                        transform:
                                                            'translateY(-50%)',
                                                        background: 'none',
                                                        border: 'none',
                                                        padding: 0,
                                                        cursor: 'pointer',
                                                        color: '#9DB3B8',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff
                                                            size={16}
                                                            strokeWidth={1.5}
                                                        />
                                                    ) : (
                                                        <Eye
                                                            size={16}
                                                            strokeWidth={1.5}
                                                        />
                                                    )}
                                                </button>
                                            </div>
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        {/* Remember me */}
                                        <label
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                cursor: 'pointer',
                                                userSelect: 'none',
                                            }}
                                        >
                                            <input
                                                type="hidden"
                                                name="remember"
                                                value={remember ? '1' : ''}
                                            />
                                            <span
                                                onClick={() =>
                                                    setRemember((v) => !v)
                                                }
                                                style={{
                                                    width: '18px',
                                                    height: '18px',
                                                    minWidth: '18px',
                                                    border: `1.5px solid ${remember ? '#4a909f' : '#DCE8EA'}`,
                                                    borderRadius: '5px',
                                                    background: remember
                                                        ? 'rgba(74,144,159,0.08)'
                                                        : '#F8FBFB',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition:
                                                        'border-color 0.15s, background 0.15s',
                                                }}
                                            >
                                                {remember && (
                                                    <span
                                                        style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '2px',
                                                            background:
                                                                '#b9f7fc',
                                                            boxShadow:
                                                                '0 0 0 1.5px #4a909f',
                                                        }}
                                                    />
                                                )}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: '13px',
                                                    color: '#5E7A80',
                                                }}
                                            >
                                                Mantener sesión iniciada
                                            </span>
                                        </label>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            tabIndex={4}
                                            disabled={processing}
                                            onMouseEnter={() =>
                                                setHoverSignIn(true)
                                            }
                                            onMouseLeave={() =>
                                                setHoverSignIn(false)
                                            }
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                background:
                                                    hoverSignIn && !processing
                                                        ? '#123238'
                                                        : '#1a4e57',
                                                color: '#FFFFFF',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                cursor: processing
                                                    ? 'not-allowed'
                                                    : 'pointer',
                                                opacity: processing ? 0.7 : 1,
                                                transition: 'background 0.15s',
                                                marginTop: '4px',
                                            }}
                                        >
                                            {processing
                                                ? 'Iniciando sesión…'
                                                : 'Iniciar sesión'}
                                        </button>
                                    </div>
                                )}
                            </Form>
                        </div>

                        {/* Footer */}
                        <p
                            style={{
                                textAlign: 'center',
                                fontSize: '13px',
                                color: '#5E7A80',
                            }}
                        >
                            ¿No tienes cuenta? Contacta al administrador.
                        </p>
                    </div>
                </div>
            </div>

            {/* Responsive CSS for left panel */}
            <style>{`
                @media (min-width: 980px) {
                    .lt-login-left { display: flex !important; flex-direction: column; }
                }
            `}</style>
        </>
    );
}
