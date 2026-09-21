import { Head } from "@inertiajs/react";
import { Check, ChevronDown, Pencil, Truck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type TripStatus =
    | "Scheduled"
    | "At port"
    | "On the road"
    | "Paused"
    | "Delayed"
    | "Completed"
    | "Cancelled";

interface TripData {
    id: number;
    day: number; // 0=today, 1=tomorrow
    type: "import" | "export";
    client: string;
    line: string;
    from: string;
    to: string;
    truck_id: number | null;
    truck: string | null;
    driver_id: number | null;
    driver: string | null;
    status: TripStatus;
}

interface TruckOption {
    id: number;
    plate: string;
}
interface DriverOption {
    id: number;
    name: string;
}

interface StatusCfg {
    bg: string;
    fg: string;
    dot: string;
}

const TRIP_STATUS: Record<TripStatus, StatusCfg> = {
    Scheduled: { bg: "#EEF3F4", fg: "#3D5F66", dot: "#7FA3AB" },
    "At port": { bg: "#EAF2FA", fg: "#2C4E72", dot: "#5B84B1" },
    "On the road": { bg: "#E6F4EC", fg: "#1F5C3D", dot: "#2E8055" },
    Paused: { bg: "#FBF2E1", fg: "#7A5210", dot: "#C68A1E" },
    Delayed: { bg: "#FBEAE7", fg: "#8A2A21", dot: "#C4483A" },
    Completed: { bg: "#E9EFF0", fg: "#40595E", dot: "#8AA4A9" },
    Cancelled: { bg: "#F0EFEF", fg: "#595959", dot: "#9B9B9B" },
};

const ALL_STATUSES: TripStatus[] = [
    "Scheduled",
    "At port",
    "On the road",
    "Paused",
    "Delayed",
    "Completed",
    "Cancelled",
];

const MONTHS = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
];
const DAYS_OF_WEEK = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
];

function toIso(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── StatusMenu ────────────────────────────────────────────────────────────────

interface StatusMenuProps {
    tripId: number;
    menuRect: DOMRect | null;
    onClose: () => void;
    onSelect: (id: number, status: TripStatus) => void;
}

function StatusMenu({ tripId, menuRect, onClose, onSelect }: StatusMenuProps) {
    if (!menuRect) return null;

    const MENU_H = 220;
    const flipUp = menuRect.bottom + MENU_H > window.innerHeight;
    const right = window.innerWidth - menuRect.right;
    const top = flipUp
        ? window.innerHeight - menuRect.top + 4
        : menuRect.bottom + 4;

    return (
        <>
            <div
                onClick={onClose}
                style={{ position: "fixed", inset: 0, zIndex: 998 }}
            />
            <div
                style={{
                    position: "fixed",
                    right,
                    ...(flipUp ? { bottom: top } : { top }),
                    zIndex: 999,
                    background: "#FFFFFF",
                    border: "1px solid #E0EBED",
                    borderRadius: "10px",
                    boxShadow: "0 8px 24px rgba(18,50,56,0.13)",
                    overflow: "hidden",
                    minWidth: "170px",
                }}
            >
                {ALL_STATUSES.map((s) => {
                    const cfg = TRIP_STATUS[s];
                    return (
                        <button
                            key={s}
                            onClick={() => {
                                onSelect(tripId, s);
                                onClose();
                            }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                width: "100%",
                                padding: "8px 14px",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "13px",
                                color: "#3D5F66",
                                textAlign: "left",
                            }}
                        >
                            <span
                                style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    background: cfg.dot,
                                    flexShrink: 0,
                                }}
                            />
                            {{ Scheduled: 'Programado', 'At port': 'En puerto', 'On the road': 'En ruta', Paused: 'Pausado', Delayed: 'Retrasado', Completed: 'Completado', Cancelled: 'Cancelado' }[s] ?? s}
                        </button>
                    );
                })}
            </div>
        </>
    );
}

// ─── TripRow ──────────────────────────────────────────────────────────────────

interface TripRowProps {
    trip: TripData;
    showThumb: boolean;
    showLine: boolean;
    isEditing: boolean;
    trucks: TruckOption[];
    drivers: DriverOption[];
    busyTruckIds: Set<number>; // trucks already assigned to same-day same-type trips
    busyDriverIds: Set<number>; // drivers already assigned to same-day same-type trips
    onStatusClick: (id: number, rect: DOMRect) => void;
    onEditClick: (id: number) => void;
    onPatch: (id: number, fields: Partial<TripData>) => void;
}

function TripRow({
    trip,
    showThumb,
    showLine,
    isEditing,
    trucks,
    drivers,
    busyTruckIds,
    busyDriverIds,
    onStatusClick,
    onEditClick,
    onPatch,
}: TripRowProps) {
    const [truckError, setTruckError] = useState<string | null>(null);
    const [driverError, setDriverError] = useState<string | null>(null);
    const cfg = TRIP_STATUS[trip.status];
    const statusBtnRef = useRef<HTMLButtonElement>(null);

    function handleStatusClick() {
        if (statusBtnRef.current) {
            onStatusClick(
                trip.id,
                statusBtnRef.current.getBoundingClientRect(),
            );
        }
    }

    const gridCols = [
        showThumb ? "56px" : null,
        "minmax(0,1fr)",
        showLine ? "94px" : null,
        "minmax(124px,auto)",
        "32px",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: gridCols,
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderBottom: "1px solid #EFF5F6",
                background: "#FFFFFF",
            }}
        >
            {/* Thumb */}
            {showThumb && (
                <div
                    style={{
                        width: "56px",
                        height: "44px",
                        borderRadius: "8px",
                        background: "#F2F7F8",
                        border: "1px solid #E0EBED",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <img
                        src="/images/truck-placeholder.png"
                        alt=""
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                        onError={(e) => {
                            (
                                e.currentTarget as HTMLImageElement
                            ).style.display = "none";
                        }}
                    />
                </div>
            )}

            {/* Info block */}
            <div style={{ minWidth: 0 }}>
                <div
                    style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#123238",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {trip.client}
                </div>
                <div
                    style={{
                        fontSize: "12px",
                        color: "#5E7A80",
                        marginTop: "2px",
                    }}
                >
                    {trip.from} → {trip.to}
                </div>
                {isEditing ? (
                    <div style={{ marginTop: "4px" }}>
                        <div
                            style={{
                                display: "flex",
                                gap: "6px",
                                flexWrap: "wrap",
                            }}
                        >
                            <select
                                value={trip.truck_id ?? ""}
                                onChange={(e) => {
                                    const newId = e.target.value
                                        ? Number(e.target.value)
                                        : null;
                                    const plate =
                                        trucks.find((t) => t.id === newId)
                                            ?.plate ?? null;
                                    setTruckError(null);

                                    const token =
                                        document.querySelector<HTMLMetaElement>(
                                            'meta[name="csrf-token"]',
                                        )?.content ?? "";
                                    fetch(`/trips/${trip.id}/assign`, {
                                        method: "PATCH",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "X-CSRF-TOKEN": token,
                                            Accept: "application/json",
                                        },
                                        body: JSON.stringify({
                                            truck_id: newId,
                                        }),
                                    })
                                        .then((r) => r.json())
                                        .then((data) => {
                                            if (data.ok) {
                                                onPatch(trip.id, {
                                                    truck_id: newId,
                                                    truck: plate,
                                                });
                                            } else {
                                                setTruckError(
                                                    data.error ??
                                                        "Conflicto con el camión.",
                                                );
                                            }
                                        })
                                        .catch(() =>
                                            setTruckError(
                                                "No se pudo guardar. Intenta de nuevo.",
                                            ),
                                        );
                                }}
                                style={{
                                    fontSize: "12px",
                                    border: `1px solid ${truckError ? "#C4483A" : "#DCE8EA"}`,
                                    borderRadius: "6px",
                                    padding: "3px 6px",
                                    background: "#F8FBFB",
                                    color: "#123238",
                                    outline: "none",
                                }}
                            >
                                <option value="">— Camión</option>
                                {trucks.map((t) => {
                                    const busy =
                                        busyTruckIds.has(t.id) &&
                                        t.id !== trip.truck_id;
                                    return (
                                        <option
                                            key={t.id}
                                            value={t.id}
                                            disabled={busy}
                                        >
                                            {busy
                                                ? `${t.plate} (en uso)`
                                                : t.plate}
                                        </option>
                                    );
                                })}
                            </select>
                            <select
                                value={trip.driver_id ?? ""}
                                onChange={(e) => {
                                    const newId = e.target.value
                                        ? Number(e.target.value)
                                        : null;
                                    const name =
                                        drivers.find((d) => d.id === newId)
                                            ?.name ?? null;
                                    setDriverError(null);

                                    const token =
                                        document.querySelector<HTMLMetaElement>(
                                            'meta[name="csrf-token"]',
                                        )?.content ?? "";
                                    fetch(`/trips/${trip.id}/assign`, {
                                        method: "PATCH",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "X-CSRF-TOKEN": token,
                                            Accept: "application/json",
                                        },
                                        body: JSON.stringify({
                                            driver_id: newId,
                                        }),
                                    })
                                        .then((r) => r.json())
                                        .then((data) => {
                                            if (data.ok) {
                                                onPatch(trip.id, {
                                                    driver_id: newId,
                                                    driver: name,
                                                });
                                            } else {
                                                setDriverError(
                                                    data.error ??
                                                        "Conflicto con el chofer.",
                                                );
                                            }
                                        })
                                        .catch(() =>
                                            setDriverError(
                                                "No se pudo guardar. Intenta de nuevo.",
                                            ),
                                        );
                                }}
                                style={{
                                    fontSize: "12px",
                                    border: `1px solid ${driverError ? "#C4483A" : "#DCE8EA"}`,
                                    borderRadius: "6px",
                                    padding: "3px 6px",
                                    background: "#F8FBFB",
                                    color: "#123238",
                                    outline: "none",
                                }}
                            >
                                <option value="">— Chofer</option>
                                {drivers.map((d) => {
                                    const busy =
                                        busyDriverIds.has(d.id) &&
                                        d.id !== trip.driver_id;
                                    return (
                                        <option
                                            key={d.id}
                                            value={d.id}
                                            disabled={busy}
                                        >
                                            {busy
                                                ? `${d.name} (en uso)`
                                                : d.name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        {truckError && (
                            <div
                                style={{
                                    fontSize: "11px",
                                    color: "#C4483A",
                                    marginTop: "3px",
                                    maxWidth: "260px",
                                }}
                            >
                                {truckError}
                            </div>
                        )}
                        {driverError && (
                            <div
                                style={{
                                    fontSize: "11px",
                                    color: "#C4483A",
                                    marginTop: "3px",
                                    maxWidth: "260px",
                                }}
                            >
                                {driverError}
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        style={{
                            fontSize: "11.5px",
                            color: "#9DB3B8",
                            marginTop: "2px",
                        }}
                    >
                        {trip.truck && trip.driver ? (
                            `${trip.truck} · ${trip.driver}`
                        ) : trip.truck && !trip.driver ? (
                            <>
                                <span>{trip.truck}</span>{" "}
                                <span style={{ color: "#C4483A" }}>
                                    · Sin chofer
                                </span>
                            </>
                        ) : !trip.truck && trip.driver ? (
                            <>
                                <span style={{ color: "#C4483A" }}>
                                    Sin camión
                                </span>{" "}
                                <span>· {trip.driver}</span>
                            </>
                        ) : (
                            <span style={{ color: "#C4483A" }}>
                                Sin camión ni chofer asignado
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Line chip */}
            {showLine && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minWidth: 0,
                    }}
                >
                    <span
                        style={{
                            fontSize: "11px",
                            background: "#EDF3F4",
                            color: "#3D5F66",
                            borderRadius: "100px",
                            padding: "3px 10px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "100%",
                        }}
                    >
                        {trip.line}
                    </span>
                </div>
            )}

            {/* Status button */}
            <button
                ref={statusBtnRef}
                onClick={handleStatusClick}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    background: cfg.bg,
                    border: "none",
                    borderRadius: "100px",
                    padding: "4px 8px 4px 10px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: cfg.fg,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                }}
            >
                <span
                    style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: cfg.dot,
                        flexShrink: 0,
                    }}
                />
                {{ Scheduled: 'Programado', 'At port': 'En puerto', 'On the road': 'En ruta', Paused: 'Pausado', Delayed: 'Retrasado', Completed: 'Completado', Cancelled: 'Cancelado' }[trip.status] ?? trip.status}
                <ChevronDown
                    size={11}
                    strokeWidth={2.5}
                    style={{ opacity: 0.6, marginLeft: "1px" }}
                />
            </button>

            {/* Edit button */}
            <button
                onClick={() => onEditClick(trip.id)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "28px",
                    height: "28px",
                    background: isEditing ? "#E6F4EC" : "#F2F7F8",
                    border: `1px solid ${isEditing ? "#2E8055" : "#E0EBED"}`,
                    borderRadius: "7px",
                    cursor: "pointer",
                    color: isEditing ? "#2E8055" : "#5E7A80",
                }}
            >
                {isEditing ? (
                    <Check size={14} strokeWidth={2} />
                ) : (
                    <Pencil size={14} strokeWidth={1.5} />
                )}
            </button>
        </div>
    );
}

// ─── TripColumn ───────────────────────────────────────────────────────────────

interface TripColumnProps {
    title: string;
    note: string;
    trips: TripData[];
    allDayTrips: TripData[];
    showThumb: boolean;
    showLine: boolean;
    editId: number | null;
    trucks: TruckOption[];
    drivers: DriverOption[];
    onStatusClick: (id: number, rect: DOMRect) => void;
    onEditClick: (id: number) => void;
    onPatch: (id: number, fields: Partial<TripData>) => void;
}

function TripColumn({
    title,
    note,
    trips,
    allDayTrips,
    showThumb,
    showLine,
    editId,
    trucks,
    drivers,
    onStatusClick,
    onEditClick,
    onPatch,
}: TripColumnProps) {
    return (
        <div
            style={{
                background: "#FFFFFF",
                border: "1px solid #E0EBED",
                borderRadius: "14px",
                overflow: "hidden",
                flex: 1,
                minWidth: 0,
            }}
        >
            {/* Column header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "14px 16px 12px",
                    borderBottom: "1px solid #EFF5F6",
                    background: "#F8FBFB",
                }}
            >
                <span
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "30px",
                        height: "30px",
                        background: "#EDF3F4",
                        borderRadius: "8px",
                        flexShrink: 0,
                    }}
                >
                    <Truck size={16} strokeWidth={1.5} color="#3D5F66" />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#123238",
                        }}
                    >
                        {title}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#5E7A80" }}>
                        {note}
                    </div>
                </div>
                <span
                    style={{
                        fontSize: "12px",
                        background: "#EDF3F4",
                        color: "#3D5F66",
                        borderRadius: "100px",
                        padding: "2px 10px",
                        fontWeight: 500,
                        flexShrink: 0,
                    }}
                >
                    {trips.length}
                </span>
            </div>

            {/* Rows */}
            {trips.length === 0 ? (
                <div
                    style={{
                        padding: "32px 16px",
                        textAlign: "center",
                        fontSize: "13px",
                        color: "#9DB3B8",
                    }}
                >
                    Sin viajes para este día.
                </div>
            ) : (
                trips.map((trip) => {
                    const activeSameType = allDayTrips.filter(
                        (t) =>
                            t.id !== trip.id &&
                            t.type === trip.type &&
                            !["Completed", "Cancelled"].includes(t.status),
                    );
                    const busyTruckIds = new Set<number>(
                        activeSameType
                            .filter((t) => t.truck_id !== null)
                            .map((t) => t.truck_id!),
                    );
                    const busyDriverIds = new Set<number>(
                        activeSameType
                            .filter((t) => t.driver_id !== null)
                            .map((t) => t.driver_id!),
                    );
                    return (
                        <TripRow
                            key={trip.id}
                            trip={trip}
                            showThumb={showThumb}
                            showLine={showLine}
                            isEditing={editId === trip.id}
                            trucks={trucks}
                            drivers={drivers}
                            busyTruckIds={busyTruckIds}
                            busyDriverIds={busyDriverIds}
                            onStatusClick={onStatusClick}
                            onEditClick={onEditClick}
                            onPatch={onPatch}
                        />
                    );
                })
            )}
        </div>
    );
}

// ─── TripControlBoard ─────────────────────────────────────────────────────────

function TripControlBoard({
    initialTrips,
    trucks,
    drivers,
}: {
    initialTrips?: TripData[];
    trucks: TruckOption[];
    drivers: DriverOption[];
}) {
    const [trips, setTrips] = useState<TripData[]>(initialTrips ?? []);
    const [boardDay, setBoardDay] = useState<0 | 1 | "pick">(0);
    const [pickedDate, setPickedDate] = useState<string>("");
    const [editId, setEditId] = useState<number | null>(null);
    const [statusId, setStatusId] = useState<number | null>(null);
    const [menuRect, setMenuRect] = useState<DOMRect | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerW, setContainerW] = useState(800);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) setContainerW(entry.contentRect.width);
        });
        observer.observe(el);
        setContainerW(el.getBoundingClientRect().width);
        return () => observer.disconnect();
    }, []);

    const twoCol = containerW >= 800;
    const showThumb = containerW >= 600;
    const showLine = twoCol && containerW >= 1040;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeDay =
        boardDay === "pick"
            ? pickedDate
                ? new Date(pickedDate + "T00:00:00")
                : today
            : boardDay === 0
              ? today
              : tomorrow;

    const activeDayStr =
        boardDay === "pick"
            ? pickedDate
            : boardDay === 0
              ? toIso(today)
              : toIso(tomorrow);

    const filteredForDay = useCallback(
        (type: "import" | "export") => {
            if (boardDay === "pick") {
                const diff = pickedDate
                    ? Math.round(
                          (new Date(pickedDate + "T00:00:00").getTime() -
                              new Date(toIso(today) + "T00:00:00").getTime()) /
                              86400000,
                      )
                    : 0;
                const dayVal = diff === 0 ? 0 : diff === 1 ? 1 : -1;
                return trips.filter(
                    (t) =>
                        t.type === type &&
                        (dayVal >= 0 ? t.day === dayVal : false),
                );
            }
            return trips.filter((t) => t.type === type && t.day === boardDay);
        },
        [trips, boardDay, pickedDate, today],
    );

    const imports = filteredForDay("import");
    const exports = filteredForDay("export");

    function patchTrip(id: number, fields: Partial<TripData>) {
        setTrips((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...fields } : t)),
        );

        if (fields.status !== undefined) {
            const token =
                document.querySelector<HTMLMetaElement>(
                    'meta[name="csrf-token"]',
                )?.content ?? "";
            fetch(`/trips/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": token,
                    Accept: "application/json",
                },
                body: JSON.stringify({ status: fields.status }),
            });
        }
    }

    function handleStatusClick(id: number, rect: DOMRect) {
        setStatusId(id);
        setMenuRect(rect);
    }

    function handleEditClick(id: number) {
        setEditId((prev) => (prev === id ? null : id));
    }

    function handleStatusSelect(id: number, status: TripStatus) {
        patchTrip(id, { status });
        setStatusId(null);
        setMenuRect(null);
    }

    const dayTripsFilter = (t: TripData) => {
        if (boardDay === "pick") {
            const diff = pickedDate
                ? Math.round(
                      (new Date(pickedDate + "T00:00:00").getTime() -
                          new Date(toIso(today) + "T00:00:00").getTime()) /
                          86400000,
                  )
                : 0;
            return (diff === 0 && t.day === 0) || (diff === 1 && t.day === 1);
        }
        return t.day === boardDay;
    };

    const noTruckCount = trips
        .filter(dayTripsFilter)
        .filter((t) => !t.truck).length;
    const noDriverCount = trips
        .filter(dayTripsFilter)
        .filter((t) => !t.driver).length;

    const displayDateLabel =
        boardDay === 0
            ? `Hoy — ${DAYS_OF_WEEK[today.getDay()]}, ${today.getDate()} de ${MONTHS[today.getMonth()]}`
            : boardDay === 1
              ? `Mañana — ${DAYS_OF_WEEK[tomorrow.getDay()]}, ${tomorrow.getDate()} de ${MONTHS[tomorrow.getMonth()]}`
              : activeDayStr
                ? `${DAYS_OF_WEEK[activeDay.getDay()]}, ${activeDay.getDate()} de ${MONTHS[activeDay.getMonth()]} de ${activeDay.getFullYear()}`
                : "Elegir fecha";

    return (
        <div ref={containerRef}>
            {/* Board header */}
            <div
                style={{
                    padding: "4px 2px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                }}
            >
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontFamily: "'Bitter', Georgia, serif",
                            fontWeight: 600,
                            fontSize: "16px",
                            color: "#123238",
                        }}
                    >
                        Tablero de operaciones
                    </div>
                    <div
                        style={{
                            fontSize: "12px",
                            color: "#5E7A80",
                            marginTop: "2px",
                        }}
                    >
                        {displayDateLabel}
                    </div>
                </div>

                {/* Tabs */}
                <div
                    style={{
                        display: "flex",
                        gap: "4px",
                        background: "#F2F7F8",
                        border: "1px solid #E0EBED",
                        borderRadius: "10px",
                        padding: "3px",
                    }}
                >
                    {([0, 1, "pick"] as const).map((d) => {
                        const isActive = boardDay === d;
                        const label =
                            d === 0
                                ? "Hoy"
                                : d === 1
                                  ? "Mañana"
                                  : "Elegir fecha";
                        return (
                            <button
                                key={String(d)}
                                onClick={() => {
                                    setBoardDay(d);
                                    if (d !== "pick") setPickedDate("");
                                }}
                                style={{
                                    padding: "5px 14px",
                                    borderRadius: "7px",
                                    border: "none",
                                    background: isActive
                                        ? "#FFFFFF"
                                        : "transparent",
                                    boxShadow: isActive
                                        ? "0 1px 4px rgba(18,50,56,0.1)"
                                        : "none",
                                    fontSize: "12.5px",
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? "#1a4e57" : "#5E7A80",
                                    cursor: "pointer",
                                    transition: "background 0.12s",
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Date picker */}
                {boardDay === "pick" && (
                    <input
                        type="date"
                        value={pickedDate}
                        onChange={(e) => setPickedDate(e.target.value)}
                        style={{
                            fontSize: "13px",
                            border: "1px solid #DCE8EA",
                            borderRadius: "8px",
                            padding: "5px 10px",
                            color: "#123238",
                            background: "#F8FBFB",
                            outline: "none",
                        }}
                    />
                )}
            </div>

            {/* Columns */}
            <div
                style={{
                    display: "flex",
                    gap: "12px",
                    flexDirection: twoCol ? "row" : "column",
                }}
            >
                <TripColumn
                    title="Importaciones"
                    note="Puerto → Ciudad"
                    trips={imports}
                    allDayTrips={[...imports, ...exports]}
                    showThumb={showThumb}
                    showLine={showLine}
                    editId={editId}
                    trucks={trucks}
                    drivers={drivers}
                    onStatusClick={handleStatusClick}
                    onEditClick={handleEditClick}
                    onPatch={patchTrip}
                />
                <TripColumn
                    title="Exportaciones"
                    note="Ciudad → Puerto"
                    trips={exports}
                    allDayTrips={[...imports, ...exports]}
                    showThumb={showThumb}
                    showLine={showLine}
                    editId={editId}
                    trucks={trucks}
                    drivers={drivers}
                    onStatusClick={handleStatusClick}
                    onEditClick={handleEditClick}
                    onPatch={patchTrip}
                />
            </div>

            {/* Footer */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginTop: "14px",
                    paddingTop: "14px",
                    borderTop: "1px solid #EFF5F6",
                }}
            >
                {(noTruckCount > 0 || noDriverCount > 0) && (
                    <div style={{ fontSize: "12.5px", color: "#C4483A" }}>
                        {noTruckCount > 0 && (
                            <span>
                                {noTruckCount} viaje{noTruckCount !== 1 ? "s" : ""} sin camión.{" "}
                            </span>
                        )}
                        {noDriverCount > 0 && (
                            <span>
                                {noDriverCount} viaje{noDriverCount !== 1 ? "s" : ""} sin chofer.
                            </span>
                        )}
                    </div>
                )}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        flexWrap: "wrap",
                    }}
                >
                    {ALL_STATUSES.map((s) => {
                        const cfg = TRIP_STATUS[s];
                        return (
                            <span
                                key={s}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    fontSize: "11.5px",
                                    color: "#5E7A80",
                                }}
                            >
                                <span
                                    style={{
                                        width: "7px",
                                        height: "7px",
                                        borderRadius: "50%",
                                        background: cfg.dot,
                                        flexShrink: 0,
                                    }}
                                />
                                {{ Scheduled: 'Programado', 'At port': 'En puerto', 'On the road': 'En ruta', Paused: 'Pausado', Delayed: 'Retrasado', Completed: 'Completado', Cancelled: 'Cancelado' }[s] ?? s}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* StatusMenu */}
            {statusId !== null && (
                <StatusMenu
                    tripId={statusId}
                    menuRect={menuRect}
                    onClose={() => {
                        setStatusId(null);
                        setMenuRect(null);
                    }}
                    onSelect={handleStatusSelect}
                />
            )}

            <span style={{ display: "none" }}>{activeDayStr}</span>
        </div>
    );
}

// ─── Operations page ───────────────────────────────────────────────────────────

interface OperationsPageProps {
    dbTrips?: TripData[];
    trucks: TruckOption[];
    drivers: DriverOption[];
}

export default function Operations({
    dbTrips,
    trucks,
    drivers,
}: OperationsPageProps) {
    return (
        <>
            <Head title="Operaciones" />
            <TripControlBoard
                initialTrips={dbTrips}
                trucks={trucks}
                drivers={drivers}
            />
        </>
    );
}
