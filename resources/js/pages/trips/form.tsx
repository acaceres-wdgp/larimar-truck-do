import { Head, Link, router, useForm } from "@inertiajs/react";
import { Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TripRow {
    id: number;
    order_number: string | null;
    direction: "import" | "export";
    trip_date: string;
    client_id: number;
    shipping_line_id: number;
    origin_type: string;
    origin_id: number;
    destination_type: string;
    destination_id: number;
    distance_km: number | null;
    status: string;
    container_number: string | null;
    container_size: string;
    cargo_type: string;
    weight_tons: number | null;
    truck_id: number | null;
    driver_id: number | null;
    rate: number | null;
    fuel_cost: number | null;
    toll_cost: number | null;
    driver_pay: number | null;
}

interface ActiveTrip {
    trip_id: number;
    truck_id: number;
    driver_id: number | null;
    date: string;
    type: string;
    origin_type: string;
    origin_id: number;
    destination_type: string;
    destination_id: number;
}

interface PageProps {
    trip: TripRow | null;
    next_order: string;
    clients: { id: number; name: string }[];
    shipping_lines: { id: number; name: string }[];
    cities: { id: number; name: string; km: number }[];
    ports: { id: number; name: string; km: number }[];
    trucks: { id: number; plate: string }[];
    drivers: { id: number; name: string }[];
    active_trips: ActiveTrip[];
    today: string;
}

function isTruckBusy(
    truckId: number,
    activeTrips: ActiveTrip[],
    date: string,
    type: string,
    originType: string,
    originId: number,
    destType: string,
    destId: number,
    excludeTripId?: number,
): boolean {
    const dayTrips = activeTrips.filter(
        (t) =>
            t.truck_id === truckId &&
            t.date === date &&
            t.trip_id !== excludeTripId,
    );
    for (const existing of dayTrips) {
        if (existing.type === type) return true;
        const newPort =
            type === "import"
                ? originType === "port"
                    ? originId
                    : null
                : destType === "port"
                  ? destId
                  : null;
        const existPort =
            existing.type === "import"
                ? existing.origin_type === "port"
                    ? existing.origin_id
                    : null
                : existing.destination_type === "port"
                  ? existing.destination_id
                  : null;
        if (newPort && existPort && newPort === existPort) continue;
        return true;
    }
    return false;
}

function isDriverBusy(
    driverId: number,
    activeTrips: ActiveTrip[],
    date: string,
    type: string,
    excludeTripId?: number,
): boolean {
    return activeTrips.some(
        (t) =>
            t.driver_id === driverId &&
            t.date === date &&
            t.type === type &&
            t.trip_id !== excludeTripId,
    );
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #DCE8EA",
    background: "#F8FBFB",
    borderRadius: "9px",
    padding: "10px 12px",
    fontSize: "13.5px",
    color: "#123238",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12.5px",
    fontWeight: 500,
    color: "#3D5F66",
    marginBottom: "6px",
};

const sectionTitleStyle: React.CSSProperties = {
    fontSize: "10.5px",
    fontWeight: 500,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#7E9AA0",
    marginBottom: "12px",
};

const dividerStyle: React.CSSProperties = {
    height: "1px",
    background: "#EFF5F6",
    margin: "22px 0 18px",
};

const STATUSES = [
    "Scheduled",
    "At port",
    "On the road",
    "Paused",
    "Delayed",
    "Completed",
];
const CONTAINER_SIZES = ["20'", "40'", "40' HC"];
const CARGO_TYPES = ["Dry", "Reefer", "Hazardous"];

function formatDate(dateStr: string): string {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("es-DO", {
        weekday: "long",
        month: "short",
        day: "numeric",
    });
}

function fmtMoney(val: number): string {
    return new Intl.NumberFormat("es-DO", { maximumFractionDigits: 0 }).format(
        val,
    );
}

export default function TripForm({
    trip,
    next_order,
    clients,
    shipping_lines,
    cities,
    ports,
    trucks,
    drivers,
    active_trips,
    today,
}: PageProps) {
    const isEdit = trip !== null;
    const tomorrow = (() => {
        const d = new Date(today + "T00:00:00");
        d.setDate(d.getDate() + 1);
        return d.toISOString().split("T")[0];
    })();

    const form = useForm<{
        order_number: string;
        direction: string;
        trip_date: string;
        client_id: string | number;
        shipping_line_id: string | number;
        origin_type: string;
        origin_id: string | number;
        destination_type: string;
        destination_id: string | number;
        distance_km: string | number;
        status: string;
        container_number: string;
        container_size: string;
        cargo_type: string;
        weight_tons: string | number;
        truck_id: string | number;
        driver_id: string | number;
        rate: string | number;
        fuel_cost: string | number;
        toll_cost: string | number;
        driver_pay: string | number;
    }>({
        order_number: trip?.order_number ?? next_order,
        direction: trip?.direction ?? "import",
        trip_date: trip?.trip_date ?? today,
        client_id: trip?.client_id ?? "",
        shipping_line_id: trip?.shipping_line_id ?? "",
        origin_type: trip?.origin_type ?? "",
        origin_id: trip?.origin_id ?? "",
        destination_type: trip?.destination_type ?? "",
        destination_id: trip?.destination_id ?? "",
        distance_km: trip?.distance_km ?? "",
        status: trip?.status ?? "Scheduled",
        container_number: trip?.container_number ?? "",
        container_size: trip?.container_size ?? "40'",
        cargo_type: trip?.cargo_type ?? "Dry",
        weight_tons: trip?.weight_tons ?? "",
        truck_id: trip?.truck_id ?? "",
        driver_id: trip?.driver_id ?? "",
        rate: trip?.rate ?? "",
        fuel_cost: trip?.fuel_cost ?? "",
        toll_cost: trip?.toll_cost ?? "",
        driver_pay: trip?.driver_pay ?? "",
    });

    const outerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const [outerW, setOuterW] = useState(1100);
    const [formW, setFormW] = useState(700);

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

    const twoColOuter = outerW >= 1080;
    const twoColFields = formW >= 760;

    const fieldGrid: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: twoColFields ? "1fr 1fr" : "1fr",
        gap: "14px 16px",
    };

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit) {
            form.put(`/trips/${trip!.id}`);
        } else {
            form.post("/trips");
        }
    }

    function handleOriginChange(value: string) {
        if (!value) {
            form.setData("origin_type", "");
            form.setData("origin_id", "");
        } else {
            const [type, id] = value.split(":");
            form.setData("origin_type", type);
            form.setData("origin_id", id);
            // auto-update distance
            autoDistance(
                type,
                Number(id),
                form.data.destination_type,
                Number(form.data.destination_id),
            );
        }
    }

    function handleDestinationChange(value: string) {
        if (!value) {
            form.setData("destination_type", "");
            form.setData("destination_id", "");
        } else {
            const [type, id] = value.split(":");
            form.setData("destination_type", type);
            form.setData("destination_id", id);
            autoDistance(
                form.data.origin_type,
                Number(form.data.origin_id),
                type,
                Number(id),
            );
        }
    }

    function autoDistance(ot: string, oid: number, dt: string, did: number) {
        const originKm =
            ot === "city"
                ? (cities.find((c) => c.id === oid)?.km ?? 0)
                : (ports.find((p) => p.id === oid)?.km ?? 0);
        const destKm =
            dt === "city"
                ? (cities.find((c) => c.id === did)?.km ?? 0)
                : (ports.find((p) => p.id === did)?.km ?? 0);
        if (originKm > 0 || destKm > 0) {
            form.setData("distance_km", Math.max(originKm, destKm));
        }
    }

    // Summary computations
    const clientName =
        clients.find((c) => c.id === Number(form.data.client_id))?.name ??
        "Sin seleccionar";
    const lineName =
        shipping_lines.find((l) => l.id === Number(form.data.shipping_line_id))
            ?.name ?? "Sin seleccionar";

    const originName =
        form.data.origin_type === "city"
            ? cities.find((c) => c.id === Number(form.data.origin_id))?.name
            : form.data.origin_type === "port"
              ? ports.find((p) => p.id === Number(form.data.origin_id))?.name
              : null;
    const destName =
        form.data.destination_type === "city"
            ? cities.find((c) => c.id === Number(form.data.destination_id))
                  ?.name
            : form.data.destination_type === "port"
              ? ports.find((p) => p.id === Number(form.data.destination_id))
                    ?.name
              : null;

    const truckPlate = trucks.find(
        (t) => t.id === Number(form.data.truck_id),
    )?.plate;
    const driverName = drivers.find(
        (d) => d.id === Number(form.data.driver_id),
    )?.name;
    const crew =
        truckPlate && driverName
            ? `${truckPlate} · ${driverName}`
            : truckPlate || driverName || "Sin asignar";

    const rate = Number(form.data.rate) || 0;
    const costs =
        (Number(form.data.fuel_cost) || 0) +
        (Number(form.data.toll_cost) || 0) +
        (Number(form.data.driver_pay) || 0);
    const margin = rate - costs;
    const marginPct = rate > 0 ? Math.round((margin / rate) * 100) : 0;

    const dateLabel = !form.data.trip_date
        ? "Sin fecha seleccionada"
        : form.data.trip_date === today
          ? `Hoy, ${formatDate(String(form.data.trip_date))}`
          : form.data.trip_date === tomorrow
            ? `Mañana, ${formatDate(String(form.data.trip_date))}`
            : formatDate(String(form.data.trip_date));

    const originValue =
        form.data.origin_type && form.data.origin_id
            ? `${form.data.origin_type}:${form.data.origin_id}`
            : "";
    const destValue =
        form.data.destination_type && form.data.destination_id
            ? `${form.data.destination_type}:${form.data.destination_id}`
            : "";

    const hasErrors = Object.keys(form.errors).length > 0;

    const pageTitle = isEdit ? "Editar viaje" : "Programar un viaje";

    // [hoverCancel, hoverSubmit]
    const [hoverCancel, setHoverCancel] = useState(false);
    const [hoverSubmit, setHoverSubmit] = useState(false);

    return (
        <>
            <Head title={pageTitle} />

            {/* Page header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    gap: "18px",
                    flexWrap: "wrap",
                    marginBottom: "20px",
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: "11.5px",
                            color: "#5E7A80",
                            marginBottom: "4px",
                        }}
                    >
                        Inicio /{" "}
                        <Link
                            href="/dashboard"
                            style={{ color: "#4a909f", textDecoration: "none" }}
                        >
                            Panel
                        </Link>{" "}
                        / {pageTitle}
                    </div>
                    <h2
                        style={{
                            fontFamily: "'Bitter', Georgia, serif",
                            fontWeight: 600,
                            fontSize: "25px",
                            letterSpacing: "-0.02em",
                            color: "#123238",
                            margin: 0,
                        }}
                    >
                        {pageTitle}
                    </h2>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        type="button"
                        onClick={() => router.get("/dashboard")}
                        onMouseEnter={() => setHoverCancel(true)}
                        onMouseLeave={() => setHoverCancel(false)}
                        style={{
                            padding: "9px 20px",
                            background: hoverCancel ? "#EDF3F4" : "#FFFFFF",
                            border: "1px solid #DCE8EA",
                            borderRadius: "9px",
                            fontSize: "13.5px",
                            fontWeight: 500,
                            color: "#1a4e57",
                            cursor: "pointer",
                            transition: "background 0.12s",
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="trip-form"
                        disabled={form.processing}
                        onMouseEnter={() => setHoverSubmit(true)}
                        onMouseLeave={() => setHoverSubmit(false)}
                        style={{
                            padding: "9px 20px",
                            background: form.processing
                                ? "#7E9AA0"
                                : hoverSubmit
                                  ? "#123238"
                                  : "#1a4e57",
                            border: "none",
                            borderRadius: "9px",
                            fontSize: "13.5px",
                            fontWeight: 500,
                            color: "#FFFFFF",
                            cursor: form.processing ? "not-allowed" : "pointer",
                            transition: "background 0.12s",
                        }}
                    >
                        {form.processing
                            ? "Guardando…"
                            : isEdit
                              ? "Actualizar viaje"
                              : "Programar viaje"}
                    </button>
                </div>
            </div>

            {/* Two-column layout */}
            <form id="trip-form" onSubmit={handleSubmit}>
                <div
                    ref={outerRef}
                    style={{
                        display: "grid",
                        gridTemplateColumns: twoColOuter ? "1.7fr 1fr" : "1fr",
                        gap: "20px",
                        alignItems: "start",
                    }}
                >
                    {/* LEFT CARD: Trip details */}
                    <div
                        ref={formRef}
                        style={{
                            background: "#FFFFFF",
                            border: "1px solid #E0EBED",
                            borderRadius: "14px",
                            padding: "24px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "15px",
                                fontWeight: 600,
                                color: "#123238",
                                marginBottom: "4px",
                            }}
                        >
                            Detalles del viaje
                        </div>
                        <div
                            style={{
                                fontSize: "12.5px",
                                color: "#5E7A80",
                                marginBottom: "20px",
                            }}
                        >
                            Un viaje transporta un contenedor. Los campos marcados con * son obligatorios.
                        </div>

                        {/* ── ORDER ── */}
                        <div style={sectionTitleStyle}>Orden</div>

                        {/* Direction toggle */}
                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                marginBottom: "16px",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    form.setData("direction", "import")
                                }
                                style={{
                                    flex: 1,
                                    padding: "12px 16px",
                                    background:
                                        form.data.direction === "import"
                                            ? "#E3F1F3"
                                            : "#FFFFFF",
                                    border: `1px solid ${form.data.direction === "import" ? "#4a909f" : "#DCE8EA"}`,
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    textAlign: "left" as const,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        marginBottom: "3px",
                                    }}
                                >
                                    <Truck
                                        size={15}
                                        color={
                                            form.data.direction === "import"
                                                ? "#1a4e57"
                                                : "#5E7A80"
                                        }
                                    />
                                    <span
                                        style={{
                                            fontSize: "13.5px",
                                            fontWeight: 600,
                                            color:
                                                form.data.direction === "import"
                                                    ? "#1a4e57"
                                                    : "#5E7A80",
                                        }}
                                    >
                                        Importación
                                    </span>
                                </div>
                                <div
                                    style={{
                                        fontSize: "11.5px",
                                        color:
                                            form.data.direction === "import"
                                                ? "#1a4e57"
                                                : "#5E7A80",
                                    }}
                                >
                                    Puerto → Ciudad
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    form.setData("direction", "export")
                                }
                                style={{
                                    flex: 1,
                                    padding: "12px 16px",
                                    background:
                                        form.data.direction === "export"
                                            ? "#E3F1F3"
                                            : "#FFFFFF",
                                    border: `1px solid ${form.data.direction === "export" ? "#4a909f" : "#DCE8EA"}`,
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    textAlign: "left" as const,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        marginBottom: "3px",
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "inline-block",
                                            transform: "scaleX(-1)",
                                        }}
                                    >
                                        <Truck
                                            size={15}
                                            color={
                                                form.data.direction === "export"
                                                    ? "#1a4e57"
                                                    : "#5E7A80"
                                            }
                                        />
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "13.5px",
                                            fontWeight: 600,
                                            color:
                                                form.data.direction === "export"
                                                    ? "#1a4e57"
                                                    : "#5E7A80",
                                        }}
                                    >
                                        Exportación
                                    </span>
                                </div>
                                <div
                                    style={{
                                        fontSize: "11.5px",
                                        color:
                                            form.data.direction === "export"
                                                ? "#1a4e57"
                                                : "#5E7A80",
                                    }}
                                >
                                    Ciudad → Puerto
                                </div>
                            </button>
                        </div>

                        <div style={fieldGrid}>
                            <div>
                                <label style={labelStyle}>Número de orden</label>
                                <input
                                    style={inputStyle}
                                    value={form.data.order_number}
                                    onChange={(e) =>
                                        form.setData(
                                            "order_number",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="TRP-1001"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Fecha del viaje *</label>
                                <input
                                    type="date"
                                    style={inputStyle}
                                    value={String(form.data.trip_date)}
                                    onChange={(e) =>
                                        form.setData(
                                            "trip_date",
                                            e.target.value,
                                        )
                                    }
                                />
                                {form.errors.trip_date && (
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#C4483A",
                                            marginTop: "4px",
                                        }}
                                    >
                                        {form.errors.trip_date}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={labelStyle}>Cliente *</label>
                                <select
                                    style={inputStyle}
                                    value={form.data.client_id}
                                    onChange={(e) =>
                                        form.setData(
                                            "client_id",
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">— Seleccionar cliente —</option>
                                    {clients.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.client_id && (
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#C4483A",
                                            marginTop: "4px",
                                        }}
                                    >
                                        {form.errors.client_id}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={labelStyle}>
                                    Naviera *
                                </label>
                                <select
                                    style={inputStyle}
                                    value={form.data.shipping_line_id}
                                    onChange={(e) =>
                                        form.setData(
                                            "shipping_line_id",
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">— Seleccionar naviera —</option>
                                    {shipping_lines.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.name}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.shipping_line_id && (
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#C4483A",
                                            marginTop: "4px",
                                        }}
                                    >
                                        {form.errors.shipping_line_id}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={dividerStyle} />

                        {/* ── ROUTE ── */}
                        <div style={sectionTitleStyle}>Ruta</div>

                        <div style={fieldGrid}>
                            <div>
                                <label style={labelStyle}>Origen *</label>
                                <select
                                    style={inputStyle}
                                    value={originValue}
                                    onChange={(e) =>
                                        handleOriginChange(e.target.value)
                                    }
                                >
                                    <option value="">— Seleccionar origen —</option>
                                    <optgroup label="Puertos">
                                        {ports.map((p) => (
                                            <option
                                                key={`port:${p.id}`}
                                                value={`port:${p.id}`}
                                            >
                                                {p.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Ciudades">
                                        {cities.map((c) => (
                                            <option
                                                key={`city:${c.id}`}
                                                value={`city:${c.id}`}
                                            >
                                                {c.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                                {form.errors.origin_type && (
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#C4483A",
                                            marginTop: "4px",
                                        }}
                                    >
                                        {form.errors.origin_type}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={labelStyle}>Destino *</label>
                                <select
                                    style={inputStyle}
                                    value={destValue}
                                    onChange={(e) =>
                                        handleDestinationChange(e.target.value)
                                    }
                                >
                                    <option value="">
                                        — Seleccionar destino —
                                    </option>
                                    <optgroup label="Puertos">
                                        {ports.map((p) => (
                                            <option
                                                key={`port:${p.id}`}
                                                value={`port:${p.id}`}
                                            >
                                                {p.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Ciudades">
                                        {cities.map((c) => (
                                            <option
                                                key={`city:${c.id}`}
                                                value={`city:${c.id}`}
                                            >
                                                {c.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                                {form.errors.destination_id && (
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#C4483A",
                                            marginTop: "4px",
                                        }}
                                    >
                                        {form.errors.destination_id}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={labelStyle}>Distancia (km)</label>
                                <input
                                    type="number"
                                    style={inputStyle}
                                    value={form.data.distance_km}
                                    onChange={(e) =>
                                        form.setData(
                                            "distance_km",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Estado</label>
                                <select
                                    style={inputStyle}
                                    value={form.data.status}
                                    onChange={(e) =>
                                        form.setData("status", e.target.value)
                                    }
                                >
                                    {STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {{ Scheduled: 'Programado', 'At port': 'En puerto', 'On the road': 'En ruta', Paused: 'Pausado', Delayed: 'Retrasado', Completed: 'Completado' }[s] ?? s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={dividerStyle} />

                        {/* ── CONTAINER ── */}
                        <div style={sectionTitleStyle}>Contenedor</div>

                        <div style={fieldGrid}>
                            <div>
                                <label style={labelStyle}>
                                    Número de contenedor
                                </label>
                                <input
                                    style={inputStyle}
                                    value={form.data.container_number}
                                    onChange={(e) =>
                                        form.setData(
                                            "container_number",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="MSKU1234567"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Tamaño</label>
                                <select
                                    style={inputStyle}
                                    value={form.data.container_size}
                                    onChange={(e) =>
                                        form.setData(
                                            "container_size",
                                            e.target.value,
                                        )
                                    }
                                >
                                    {CONTAINER_SIZES.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Tipo de carga</label>
                                <select
                                    style={inputStyle}
                                    value={form.data.cargo_type}
                                    onChange={(e) =>
                                        form.setData(
                                            "cargo_type",
                                            e.target.value,
                                        )
                                    }
                                >
                                    {CARGO_TYPES.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Peso (toneladas)</label>
                                <input
                                    type="number"
                                    style={inputStyle}
                                    value={form.data.weight_tons}
                                    onChange={(e) =>
                                        form.setData(
                                            "weight_tons",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div style={dividerStyle} />

                        {/* ── ASSIGNMENT ── */}
                        <div style={sectionTitleStyle}>Asignación</div>
                        <div
                            style={{
                                fontSize: "12px",
                                color: "#7E9AA0",
                                marginBottom: "12px",
                            }}
                        >
                            Se requiere camión y chofer para programar el viaje.
                            Se pueden reasignar desde el tablero de operaciones.
                        </div>

                        <div style={fieldGrid}>
                            <div>
                                <label style={labelStyle}>
                                    Camión{" "}
                                    <span style={{ color: "#C4483A" }}>*</span>
                                </label>
                                <select
                                    style={{
                                        ...inputStyle,
                                        borderColor: form.errors.truck_id
                                            ? "#C4483A"
                                            : undefined,
                                    }}
                                    value={form.data.truck_id}
                                    onChange={(e) =>
                                        form.setData("truck_id", e.target.value)
                                    }
                                >
                                    <option value="">— Seleccionar camión —</option>
                                    {trucks.map((t) => {
                                        const busy =
                                            form.data.trip_date &&
                                            form.data.direction &&
                                            isTruckBusy(
                                                t.id,
                                                active_trips,
                                                String(form.data.trip_date),
                                                String(form.data.direction),
                                                String(form.data.origin_type),
                                                Number(form.data.origin_id),
                                                String(
                                                    form.data.destination_type,
                                                ),
                                                Number(
                                                    form.data.destination_id,
                                                ),
                                                trip?.id,
                                            );
                                        return (
                                            <option
                                                key={t.id}
                                                value={t.id}
                                                disabled={!!busy}
                                            >
                                                {busy
                                                    ? `${t.plate} (no disponible)`
                                                    : t.plate}
                                            </option>
                                        );
                                    })}
                                </select>
                                {form.errors.truck_id && (
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#C4483A",
                                            marginTop: "4px",
                                        }}
                                    >
                                        {form.errors.truck_id}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={labelStyle}>
                                    Chofer{" "}
                                    <span style={{ color: "#C4483A" }}>*</span>
                                </label>
                                <select
                                    style={{
                                        ...inputStyle,
                                        borderColor: form.errors.driver_id
                                            ? "#C4483A"
                                            : undefined,
                                    }}
                                    value={form.data.driver_id}
                                    onChange={(e) =>
                                        form.setData(
                                            "driver_id",
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">— Seleccionar chofer —</option>
                                    {drivers.map((d) => {
                                        const busy =
                                            form.data.trip_date &&
                                            form.data.direction &&
                                            isDriverBusy(
                                                d.id,
                                                active_trips,
                                                String(form.data.trip_date),
                                                String(form.data.direction),
                                                trip?.id,
                                            );
                                        return (
                                            <option
                                                key={d.id}
                                                value={d.id}
                                                disabled={!!busy}
                                            >
                                                {busy
                                                    ? `${d.name} (no disponible)`
                                                    : d.name}
                                            </option>
                                        );
                                    })}
                                </select>
                                {form.errors.driver_id && (
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#C4483A",
                                            marginTop: "4px",
                                        }}
                                    >
                                        {form.errors.driver_id}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={dividerStyle} />

                        {/* ── RATE & COSTS ── */}
                        <div style={sectionTitleStyle}>
                            Tarifa y costos (RD$)
                        </div>

                        <div style={fieldGrid}>
                            <div>
                                <label style={labelStyle}>
                                    Tarifa al cliente
                                </label>
                                <input
                                    type="number"
                                    style={inputStyle}
                                    value={form.data.rate}
                                    onChange={(e) =>
                                        form.setData("rate", e.target.value)
                                    }
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Combustible</label>
                                <input
                                    type="number"
                                    style={inputStyle}
                                    value={form.data.fuel_cost}
                                    onChange={(e) =>
                                        form.setData(
                                            "fuel_cost",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Peajes</label>
                                <input
                                    type="number"
                                    style={inputStyle}
                                    value={form.data.toll_cost}
                                    onChange={(e) =>
                                        form.setData(
                                            "toll_cost",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Pago al chofer</label>
                                <input
                                    type="number"
                                    style={inputStyle}
                                    value={form.data.driver_pay}
                                    onChange={(e) =>
                                        form.setData(
                                            "driver_pay",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        {/* Validation error block */}
                        {hasErrors && (
                            <div
                                style={{
                                    marginTop: "18px",
                                    padding: "12px 16px",
                                    background: "#FBEAE7",
                                    border: "1px solid #F5C4BC",
                                    borderRadius: "9px",
                                    fontSize: "12.5px",
                                    color: "#8A2A21",
                                }}
                            >
                                {Object.values(form.errors)[0]}
                            </div>
                        )}
                    </div>

                    {/* RIGHT CARD: Summary */}
                    <div
                        style={{
                            background: "#FFFFFF",
                            border: "1px solid #E0EBED",
                            borderRadius: "14px",
                            overflow: "hidden",
                        }}
                    >
                        {/* Direction + date tile */}
                        <div
                            style={{
                                padding: "20px 20px 16px",
                                borderBottom: "1px solid #EFF5F6",
                                display: "flex",
                                alignItems: "center",
                                gap: "14px",
                            }}
                        >
                            <div
                                style={{
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "10px",
                                    background: "#E3F1F3",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                {form.data.direction === "export" ? (
                                    <span
                                        style={{
                                            display: "inline-block",
                                            transform: "scaleX(-1)",
                                        }}
                                    >
                                        <Truck size={20} color="#1a4e57" />
                                    </span>
                                ) : (
                                    <Truck size={20} color="#1a4e57" />
                                )}
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: "13.5px",
                                        fontWeight: 600,
                                        color: "#123238",
                                    }}
                                >
                                    {{ import: 'Importación', export: 'Exportación' }[form.data.direction] ?? 'Importación'}
                                </div>
                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#5E7A80",
                                        marginTop: "2px",
                                    }}
                                >
                                    {dateLabel}
                                </div>
                            </div>
                        </div>

                        {/* Route block */}
                        <div
                            style={{
                                padding: "14px 20px",
                                borderBottom: "1px solid #EFF5F6",
                            }}
                        >
                            <div
                                style={{
                                    background: "#F8FBFB",
                                    borderRadius: "9px",
                                    padding: "12px 14px",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "13.5px",
                                        fontWeight: 500,
                                        color: "#123238",
                                        marginBottom: "4px",
                                    }}
                                >
                                    {originName ?? "—"} → {destName ?? "—"}
                                </div>
                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#5E7A80",
                                    }}
                                >
                                    {form.data.distance_km
                                        ? `${form.data.distance_km} km`
                                        : "— km"}{" "}
                                    · {form.data.container_size}{" "}
                                    {form.data.cargo_type}
                                </div>
                            </div>
                        </div>

                        {/* Detail rows */}
                        <div
                            style={{
                                padding: "14px 20px",
                                borderBottom: "1px solid #EFF5F6",
                            }}
                        >
                            {[
                                { label: "Cliente", value: clientName },
                                { label: "Naviera", value: lineName },
                                {
                                    label: "Contenedor",
                                    value: form.data.container_number || "—",
                                },
                                { label: "Equipo", value: crew },
                            ].map(({ label, value }) => (
                                <div
                                    key={label}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "6px 0",
                                        borderBottom: "1px solid #F3F8F9",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            color: "#7E9AA0",
                                        }}
                                    >
                                        {label}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "12.5px",
                                            color: "#123238",
                                            fontWeight: 500,
                                            textAlign: "right" as const,
                                            maxWidth: "60%",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap" as const,
                                        }}
                                    >
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Money block */}
                        <div style={{ padding: "16px 20px" }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "8px",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "12px",
                                        color: "#7E9AA0",
                                    }}
                                >
                                    Tarifa
                                </span>
                                <span
                                    style={{
                                        fontSize: "12.5px",
                                        color: "#123238",
                                        fontWeight: 500,
                                    }}
                                >
                                    {rate > 0 ? `RD$ ${fmtMoney(rate)}` : "—"}
                                </span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "12px",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "12px",
                                        color: "#7E9AA0",
                                    }}
                                >
                                    Costos
                                </span>
                                <span
                                    style={{
                                        fontSize: "12.5px",
                                        color: "#123238",
                                        fontWeight: 500,
                                    }}
                                >
                                    {costs > 0 ? `RD$ ${fmtMoney(costs)}` : "—"}
                                </span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    paddingTop: "10px",
                                    borderTop: "1px solid #EFF5F6",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "12.5px",
                                        color: "#7E9AA0",
                                        fontWeight: 500,
                                    }}
                                >
                                    Margen
                                </span>
                                <div style={{ textAlign: "right" as const }}>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Bitter', Georgia, serif",
                                            fontSize: "21px",
                                            fontWeight: 700,
                                            color:
                                                rate === 0
                                                    ? "#7E9AA0"
                                                    : margin >= 0
                                                      ? "#1F5C3D"
                                                      : "#8A2A21",
                                        }}
                                    >
                                        {rate === 0
                                            ? "—"
                                            : `RD$ ${fmtMoney(margin)}`}
                                    </div>
                                    {rate > 0 && (
                                        <div
                                            style={{
                                                fontSize: "11.5px",
                                                color:
                                                    margin >= 0
                                                        ? "#2E8055"
                                                        : "#C4483A",
                                            }}
                                        >
                                            {marginPct}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
