import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  LogOut,
  MoonStar,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  createReservation,
  getReservations,
  saveReservations,
  updateReservationStatus,
  type Reservation,
  type ReservationStatus,
} from "@/lib/admin-reservations";

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "love2026!",
};

type ViewKey = "overview" | "reservations" | "reports" | "alerts";

type NotificationItem = {
  title: string;
  description: string;
  tone: "info" | "warning" | "success";
  icon: typeof BellRing;
};

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [activeView, setActiveView] = useState<ViewKey>("overview");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("love-admin-theme") as "light" | "dark" | null;
    const initialTheme = storedTheme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setThemeMode(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");

    const authenticated = window.localStorage.getItem("love-admin-auth") === "true";
    setIsAuthenticated(authenticated);

    const storedReservations = getReservations();
    setReservations(storedReservations);
    if (storedReservations[0]) {
      setSelectedId(storedReservations[0].id);
    }
  }, []);

  useEffect(() => {
    if (!selectedId && reservations[0]) {
      setSelectedId(reservations[0].id);
    }
  }, [reservations, selectedId]);

  const selectedReservation = useMemo(
    () => reservations.find((reservation) => reservation.id === selectedId) ?? null,
    [reservations, selectedId],
  );

  useEffect(() => {
    if (selectedReservation) {
      setAdminNotes(selectedReservation.adminNotes ?? "");
    }
  }, [selectedReservation]);

  const stats = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthReservations = reservations.filter(
      (reservation) => reservation.source === "online" && reservation.date.slice(0, 7) === currentMonth,
    );

    return {
      total: monthReservations.length,
      approved: monthReservations.filter((reservation) => reservation.status === "approved").length,
      pending: monthReservations.filter((reservation) => reservation.status === "pending").length,
      postponed: monthReservations.filter((reservation) => reservation.status === "postponed").length,
      renewed: monthReservations.filter((reservation) => reservation.status === "renewed").length,
      rejected: monthReservations.filter((reservation) => reservation.status === "rejected").length,
      guests: monthReservations.reduce((sum, reservation) => sum + reservation.guests, 0),
    };
  }, [reservations]);

  const chartData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      const dayReservations = reservations.filter((reservation) => reservation.date === key);
      return {
        day: date.toLocaleDateString("es-CO", { weekday: "short" }),
        reservas: dayReservations.length,
        aprobadas: dayReservations.filter((reservation) => reservation.status === "approved").length,
      };
    });
  }, [reservations]);

  const upcomingReservations = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    return reservations
      .filter((reservation) => reservation.date >= todayKey && reservation.status !== "rejected")
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);
  }, [reservations]);

  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];

    if (stats.pending > 0) {
      items.push({
        title: `${stats.pending} reservas pendientes`,
        description: "Revisa las solicitudes que aún esperan aprobación.",
        tone: "warning",
        icon: Clock3,
      });
    }

    if (upcomingReservations.length > 0) {
      items.push({
        title: `${upcomingReservations.length} reservas próximas`,
        description: "Hay eventos ya programados para esta semana.",
        tone: "info",
        icon: CalendarDays,
      });
    }

    if (stats.total > 0) {
      const approvalRate = Math.round((stats.approved / stats.total) * 100);
      if (approvalRate >= 80) {
        items.push({
          title: "Tasa de aprobación excelente",
          description: `El ${approvalRate}% de las reservas del mes ya fue aprobada.`,
          tone: "success",
          icon: CheckCircle2,
        });
      } else if (approvalRate < 60) {
        items.push({
          title: "Revisión recomendada",
          description: "La aprobación está baja; conviene revisar las solicitudes pendientes.",
          tone: "warning",
          icon: AlertTriangle,
        });
      }
    }

    if (stats.postponed > 0) {
      items.push({
        title: `${stats.postponed} reservas aplazadas`,
        description: "Estas mesas necesitan seguimiento para reprogramarlas.",
        tone: "info",
        icon: RefreshCw,
      });
    }

    return items.slice(0, 4);
  }, [stats, upcomingReservations]);

  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username.trim() === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      window.localStorage.setItem("love-admin-auth", "true");
      setIsAuthenticated(true);
      setLoginError("");
      toast.success("Bienvenido al panel administrativo");
      return;
    }

    setLoginError("Credenciales inválidas. Usa el acceso del administrador.");
  };

  const handleLogout = () => {
    window.localStorage.removeItem("love-admin-auth");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setLoginError("");
  };

  const handleStatusChange = (reservationId: string, status: ReservationStatus) => {
    const next = updateReservationStatus(reservations, reservationId, status, adminNotes || undefined);
    setReservations(next);
    saveReservations(next);
    toast.success("Estado actualizado");
  };

  const handleSaveNote = () => {
    if (!selectedId) return;
    const next = reservations.map((reservation) =>
      reservation.id === selectedId
        ? { ...reservation, adminNotes: adminNotes.trim(), updatedAt: new Date().toISOString() }
        : reservation,
    );
    setReservations(next);
    saveReservations(next);
    toast.success("Nota guardada");
  };

  const toggleTheme = () => {
    const nextTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(nextTheme);
    window.localStorage.setItem("love-admin-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,180,172,0.2),_transparent_55%)] bg-background text-foreground">
      <Toaster richColors position="top-center" />
      <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6 lg:py-6">
        {!isAuthenticated ? (
          <section className="rounded-[2rem] border border-border bg-card/90 p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)] backdrop-blur sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <ShieldCheck size={16} />
                  <span>Acceso exclusivo</span>
                </div>
                <h1 className="mt-4 font-display text-3xl sm:text-4xl">Panel administrativo Love Restaurant</h1>
                <p className="mt-4 max-w-xl text-base text-muted-foreground">
                  Gestiona reservas, revisa detalles y monitorea el rendimiento del restaurante desde una vista profesional y organizada.
                </p>
              </div>
              <form onSubmit={handleLogin} className="rounded-[1.5rem] border border-border bg-background/80 p-5 shadow-soft">
                <label className="mb-2 block text-sm font-medium text-foreground">Usuario</label>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="mb-4 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-accent"
                  placeholder="admin"
                />
                <label className="mb-2 block text-sm font-medium text-foreground">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mb-4 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-accent"
                  placeholder="••••••••"
                />
                {loginError ? <p className="mb-4 text-sm text-rose-600">{loginError}</p> : null}
                <button
                  type="submit"
                  className="w-full rounded-full bg-gradient-to-r from-rose-deep to-primary px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground"
                >
                  Entrar al panel
                </button>
              </form>
            </div>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="rounded-[2rem] border border-border bg-card/90 p-5 shadow-soft backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-accent">Admin</p>
                  <h2 className="font-display text-xl">Love Restaurant</h2>
                </div>
              </div>

              <nav className="mt-8 space-y-2">
                {[
                  { key: "overview", label: "Resumen", icon: LayoutDashboard },
                  { key: "reservations", label: "Reservas", icon: CalendarDays },
                  { key: "reports", label: "Reportes", icon: BarChart3 },
                  { key: "alerts", label: "Alertas", icon: BellRing },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = activeView === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveView(item.key as ViewKey)}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all ${
                        active ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={16} />
                        {item.label}
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 rounded-[1.25rem] border border-border bg-background/70 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Acciones rápidas</p>
                <p className="mt-2">Revisa pendientes, confirma próximas mesas y mantén el flujo del servicio en orden.</p>
              </div>
            </aside>

            <main className="space-y-6">
              <header className="rounded-[2rem] border border-border bg-card/90 p-5 shadow-soft backdrop-blur">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-accent">Dashboard</p>
                    <h2 className="mt-2 font-display text-3xl">Bienvenido, administrador</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Gestiona el negocio con una vista clara, elegante y orientada a decisiones rápidas.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-2 rounded-full border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                      aria-label="Cambiar tema"
                    >
                      {themeMode === "dark" ? <SunMedium size={16} /> : <MoonStar size={16} />}
                      <span>{themeMode === "dark" ? "Claro" : "Oscuro"}</span>
                    </button>
                    <Link
                      to="/"
                      className="rounded-full border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      Volver a la web
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut size={16} />
                        Cerrar sesión
                      </span>
                    </button>
                  </div>
                </div>
              </header>

              {activeView === "overview" ? (
                <>
                  <section className="rounded-[2rem] border border-border bg-card/90 p-6 shadow-soft backdrop-blur">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                      <div className="max-w-2xl">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                          <Sparkles size={16} />
                          <span>Resumen ejecutivo</span>
                        </div>
                        <h3 className="mt-3 font-display text-3xl sm:text-4xl">Métricas del mes en una sola vista</h3>
                        <p className="mt-3 text-base text-muted-foreground">
                          Este mes tienes {stats.total} reservas en línea, con un {approvalRate}% de aprobación y {stats.guests} personas esperadas.
                        </p>
                      </div>
                      <div className="rounded-[1.25rem] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                        <p className="font-semibold">Reporte automático activo</p>
                        <p className="mt-1">Seguimiento diario de reservas y acciones prioritarias.</p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <StatCard label="Reservas del mes" value={stats.total.toString()} accent="text-primary" icon={<CalendarDays size={18} />} />
                      <StatCard label="Aprobadas" value={stats.approved.toString()} accent="text-emerald-600" icon={<CheckCircle2 size={18} />} />
                      <StatCard label="Pendientes" value={stats.pending.toString()} accent="text-amber-600" icon={<Clock3 size={18} />} />
                      <StatCard label="Personas" value={stats.guests.toString()} accent="text-violet-600" icon={<Users size={18} />} />
                    </div>
                  </section>

                  <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
                    <div className="rounded-[2rem] border border-border bg-card/90 p-5 shadow-soft backdrop-blur">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-accent">Rendimiento</p>
                          <h3 className="mt-1 font-display text-2xl">Reservas por día</h3>
                        </div>
                        <span className="rounded-full bg-background px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Últimos 7 días
                        </span>
                      </div>
                      <div className="mt-5 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
                            <Tooltip cursor={{ fill: "rgba(244, 180, 172, 0.10)" }} />
                            <Bar dataKey="reservas" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="aprobadas" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="rounded-[2rem] border border-border bg-card/90 p-5 shadow-soft backdrop-blur">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-accent">Alertas</p>
                          <h3 className="mt-1 font-display text-2xl">Notificaciones útiles</h3>
                        </div>
                      </div>
                      <div className="mt-5 space-y-3">
                        {notifications.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                            Todo en orden. No hay alertas urgentes por ahora.
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <NotificationCard key={notification.title} notification={notification} />
                          ))
                        )}
                      </div>
                    </div>
                  </section>
                </>
              ) : null}

              {activeView === "reservations" ? (
                <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[2rem] border border-border bg-card/90 p-5 shadow-soft backdrop-blur">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-accent">Reservas</p>
                        <h3 className="mt-1 font-display text-2xl">Listado de solicitudes</h3>
                      </div>
                      <span className="rounded-full bg-background px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {reservations.length} registros
                      </span>
                    </div>
                    <div className="space-y-3">
                      {reservations.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                          Aún no llegan reservas desde la web.
                        </div>
                      ) : (
                        reservations.map((reservation) => (
                          <button
                            key={reservation.id}
                            onClick={() => setSelectedId(reservation.id)}
                            className={`w-full rounded-[1.25rem] border p-4 text-left transition-all ${
                              selectedReservation?.id === reservation.id
                                ? "border-accent bg-accent/10"
                                : "border-border bg-background/70 hover:border-accent/50"
                            }`}
                          >
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="font-semibold text-foreground">{reservation.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {reservation.date} · {reservation.time} · {reservation.guests} personas
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em]">
                                <span className={`rounded-full px-3 py-1 ${getStatusStyles(reservation.status)}`}>
                                  {formatStatus(reservation.status)}
                                </span>
                                <span className="rounded-full bg-background px-3 py-1 text-muted-foreground">
                                  {reservation.occasion}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-border bg-card/90 p-5 shadow-soft backdrop-blur">
                    {selectedReservation ? (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-accent">Detalle</p>
                            <h3 className="mt-1 font-display text-2xl">{selectedReservation.name}</h3>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${getStatusStyles(selectedReservation.status)}`}>
                            {formatStatus(selectedReservation.status)}
                          </span>
                        </div>

                        <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                          <DetailRow label="Teléfono" value={selectedReservation.phone} />
                          <DetailRow label="Fecha" value={selectedReservation.date} />
                          <DetailRow label="Hora" value={selectedReservation.time} />
                          <DetailRow label="Personas" value={`${selectedReservation.guests}`} />
                          <DetailRow label="Ocasión" value={selectedReservation.occasion} />
                          <DetailRow label="Notas" value={selectedReservation.notes || "Sin notas"} />
                          <DetailRow label="Fuente" value={selectedReservation.source === "online" ? "Reserva web" : selectedReservation.source} />
                        </div>

                        <div className="mt-6 rounded-[1.25rem] border border-border bg-background/70 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-accent">Acciones</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button onClick={() => handleStatusChange(selectedReservation.id, "approved")} className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-medium text-white">Aprobar</button>
                            <button onClick={() => handleStatusChange(selectedReservation.id, "rejected")} className="rounded-full bg-rose-600 px-3 py-2 text-sm font-medium text-white">Desaprobar</button>
                            <button onClick={() => handleStatusChange(selectedReservation.id, "renewed")} className="rounded-full bg-violet-600 px-3 py-2 text-sm font-medium text-white">Renovar</button>
                            <button onClick={() => handleStatusChange(selectedReservation.id, "postponed")} className="rounded-full bg-sky-600 px-3 py-2 text-sm font-medium text-white">Aplazar</button>
                          </div>
                        </div>

                        <div className="mt-6">
                          <label className="mb-2 block text-sm font-medium text-foreground">Nota administrativa</label>
                          <textarea
                            value={adminNotes}
                            onChange={(event) => setAdminNotes(event.target.value)}
                            rows={4}
                            className="w-full rounded-[1.25rem] border border-input bg-background px-4 py-3 text-sm outline-none focus:border-accent"
                            placeholder="Agrega una nota para seguimiento interno"
                          />
                          <button
                            onClick={handleSaveNote}
                            className="mt-3 rounded-full border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                          >
                            Guardar nota
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Selecciona una reserva para ver su detalle.</p>
                    )}
                  </div>
                </section>
              ) : null}

              {activeView === "reports" ? (
                <section className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-[2rem] border border-border bg-card/90 p-5 shadow-soft backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.28em] text-accent">Reportes</p>
                    <h3 className="mt-2 font-display text-2xl">Tendencia del mes</h3>
                    <div className="mt-5 space-y-4">
                      <ReportCard label="Aprobación" value={`${approvalRate}%`} description="de las reservas del mes fueron aprobadas" />
                      <ReportCard label="Sesiones de servicio" value={`${stats.total}`} description="solicitudes capturadas directamente desde la web" />
                      <ReportCard label="Mesas reprogramadas" value={`${stats.postponed}`} description="reservas que requieren seguimiento para cambiar de fecha" />
                    </div>
                  </div>
                  <div className="rounded-[2rem] border border-border bg-card/90 p-5 shadow-soft backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.28em] text-accent">Insight</p>
                    <h3 className="mt-2 font-display text-2xl">Estado operativo</h3>
                    <div className="mt-5 space-y-3">
                      <InsightRow title="Pendientes por revisar" value={stats.pending.toString()} />
                      <InsightRow title="Renovaciones" value={stats.renewed.toString()} />
                      <InsightRow title="Rechazos" value={stats.rejected.toString()} />
                      <InsightRow title="Capacidad estimada" value={`${stats.guests} personas`} />
                    </div>
                  </div>
                </section>
              ) : null}

              {activeView === "alerts" ? (
                <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[2rem] border border-border bg-card/90 p-5 shadow-soft backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.28em] text-accent">Prioridades</p>
                    <h3 className="mt-2 font-display text-2xl">Tareas recomendadas</h3>
                    <div className="mt-5 space-y-3">
                      {notifications.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                          No hay tareas o alertas pendientes.
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <NotificationCard key={notification.title} notification={notification} />
                        ))
                      )}
                    </div>
                  </div>
                  <div className="rounded-[2rem] border border-border bg-card/90 p-5 shadow-soft backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.28em] text-accent">Próximas reservas</p>
                    <h3 className="mt-2 font-display text-2xl">Agenda del equipo</h3>
                    <div className="mt-5 space-y-3">
                      {upcomingReservations.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                          No hay reservas próximas registradas.
                        </div>
                      ) : (
                        upcomingReservations.map((reservation) => (
                          <div key={reservation.id} className="rounded-[1.25rem] border border-border bg-background/70 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold text-foreground">{reservation.name}</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {reservation.date} · {reservation.time}
                                </p>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${getStatusStyles(reservation.status)}`}>
                                {formatStatus(reservation.status)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </section>
              ) : null}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, icon }: { label: string; value: string; accent: string; icon: ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-background/80 p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={`rounded-full bg-background p-2 ${accent}`}>{icon}</div>
      </div>
      <p className={`mt-3 text-3xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

function NotificationCard({ notification }: { notification: NotificationItem }) {
  const toneClasses = {
    info: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  };

  const Icon = notification.icon;

  return (
    <div className={`rounded-[1.25rem] border p-4 ${toneClasses[notification.tone]}`}>
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-background/70 p-2">
          <Icon size={16} />
        </div>
        <div>
          <p className="font-semibold">{notification.title}</p>
          <p className="mt-1 text-sm opacity-90">{notification.description}</p>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="rounded-[1.25rem] border border-border bg-background/70 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function InsightRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[1.25rem] border border-border bg-background/70 px-4 py-3">
      <span className="text-sm text-muted-foreground">{title}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[1rem] border border-border/60 bg-background/60 p-3">
      <span className="text-foreground/70">{label}</span>
      <span className="max-w-[60%] text-right text-foreground">{value}</span>
    </div>
  );
}

function formatStatus(status: ReservationStatus) {
  switch (status) {
    case "approved":
      return "Aprobada";
    case "rejected":
      return "Rechazada";
    case "renewed":
      return "Renovada";
    case "postponed":
      return "Aplazada";
    default:
      return "Pendiente";
  }
}

function getStatusStyles(status: ReservationStatus) {
  switch (status) {
    case "approved":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "rejected":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
    case "renewed":
      return "bg-violet-500/10 text-violet-700 dark:text-violet-300";
    case "postponed":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300";
    default:
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
}
