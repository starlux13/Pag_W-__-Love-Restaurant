import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import heroImg from "@/assets/hero.jpg";
import { createReservation, getReservations, saveReservations } from "@/lib/admin-reservations";
import aboutImg from "@/assets/about.jpg";
import dish1 from "@/assets/dish-1.jpg";
import dish2 from "@/assets/dish-2.jpg";
import dish3 from "@/assets/dish-3.jpg";
import dish4 from "@/assets/dish-4.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Love Restaurant — Cocina romántica en Villavicencio, Meta" },
      {
        name: "description",
        content:
          "Cena bajo el árbol de cerezo rosa en Villavicencio. Cocina de autor, coctelería y la atmósfera más romántica del Meta. Reserva tu mesa.",
      },
      {
        name: "keywords",
        content:
          "restaurante romántico Villavicencio, cena romántica Meta, restaurante árbol rosa, aniversario Villavicencio, Love Restaurant",
      },
      { property: "og:title", content: "Love Restaurant — Villavicencio" },
      {
        property: "og:description",
        content: "El spot más romántico e instagrammeable de Villavicencio. Reserva tu mesa.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: "Love Restaurant",
          image: "/",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Cl. 19 #40-14",
            addressLocality: "Villavicencio",
            addressRegion: "Meta",
            addressCountry: "CO",
          },
          servesCuisine: ["Cocina de autor", "Romántica"],
          priceRange: "$$$",
          telephone: "+57 320 9837444",
        }),
      },
    ],
  }),
  component: LoveRestaurantPage,
});

const WHATSAPP_NUMBER = "573209837444";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola Love Restaurant, quiero hacer una reserva")}`;

type MenuItem = {
  name: string;
  description: string;
  price: string;
  image: string;
  tag?: string;
};

const menu: Record<string, MenuItem[]> = {
  Entradas: [
    {
      name: "Burrata Rosé",
      description:
        "Burrata fresca, tomates confitados, pesto de albahaca y reducción de balsámico rosado.",
      price: "$38.000",
      image: dish1,
      tag: "Recomendado para Compartir",
    },
    {
      name: "Carpaccio de Res",
      description:
        "Láminas finas de res, rúcula, parmesano añejado, aceite de trufa y limón Meyer.",
      price: "$42.000",
      image: dish4,
    },
  ],
  "Platos Fuertes": [
    {
      name: "Lomo en Salsa de Frutos Rojos",
      description:
        "Medallón de lomo fino, reducción de vino tinto y frutos rojos, puré de papa criolla trufada.",
      price: "$78.000",
      image: dish4,
      tag: "El Favorito de la Casa",
    },
    {
      name: "Risotto de Camarones al Azafrán",
      description: "Arroz arborio cremoso, camarones jumbo, azafrán y un toque de cítricos.",
      price: "$72.000",
      image: dish1,
    },
  ],
  "Coctelería de Autor": [
    {
      name: "Sakura Spritz",
      description: "Gin botánico, licor de lichi, prosecco rosado, flor de cerezo comestible.",
      price: "$32.000",
      image: dish2,
      tag: "El Favorito de la Casa",
    },
    {
      name: "Rosa de los Llanos",
      description: "Mezcal, jarabe de hibiscus, limón, espuma de rosas.",
      price: "$34.000",
      image: dish2,
    },
  ],
  Postres: [
    {
      name: "Rosa de Frambuesa",
      description: "Mousse de frambuesa en forma de rosa, coulis de berries y oro comestible.",
      price: "$28.000",
      image: dish3,
      tag: "El Favorito de la Casa",
    },
    {
      name: "Cheesecake Cerezo",
      description: "Cheesecake japonés con compota de cerezo y polvo de sakura.",
      price: "$26.000",
      image: dish3,
      tag: "Recomendado para Compartir",
    },
  ],
};

const testimonials = [
  {
    name: "María Camila R.",
    text: "El lugar más mágico de Villavicencio. Celebramos nuestro aniversario y fue una noche de película. El árbol rosa es impresionante.",
    rating: 5,
  },
  {
    name: "Andrés F. & Laura",
    text: "Pedí matrimonio aquí. La atención, la comida, el ambiente… todo perfecto. Gracias por hacerlo inolvidable.",
    rating: 5,
  },
  {
    name: "Daniela Pérez",
    text: "Cocina exquisita y cada plato es una obra de arte. Los cócteles son únicos. Volveré sin duda.",
    rating: 5,
  },
  {
    name: "Sebastián G.",
    text: "El mejor spot romántico del Meta. Las fotos quedaron espectaculares y la cena, de otro nivel.",
    rating: 5,
  },
];

function LoveRestaurantPage() {
  useScrollReveal();
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Toaster richColors position="top-center" />
      <Nav />
      <Hero />
      <Essence />
      <Menu />
      <Gallery />
      <Reservation />
      <Testimonials />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#esencia", label: "Esencia" },
    { href: "#menu", label: "Menú" },
    { href: "#galeria", label: "Galería" },
    { href: "#reservas", label: "Reservas" },
    { href: "#contacto", label: "Contacto" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        scrolled ? "bg-background/85 backdrop-blur-md shadow-soft" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:py-5">
        <a href="#top" className="flex items-center gap-2">
          <span className="font-display text-2xl font-semibold tracking-wide md:text-3xl">
            Love<span className="text-gradient-gold"> Restaurant</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm uppercase tracking-[0.18em] text-foreground/80 transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/admin"
            className="rounded-full border border-accent bg-accent/10 px-5 py-2 text-sm uppercase tracking-[0.18em] text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
          >
            Admin
          </a>
        </nav>
        <button onClick={() => setOpen((v) => !v)} className="md:hidden" aria-label="Menú">
          <div className="flex flex-col gap-1.5">
            <span
              className={`h-0.5 w-6 bg-foreground transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`h-0.5 w-6 bg-foreground transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`h-0.5 w-6 bg-foreground transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </div>
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur md:hidden">
          <div className="flex flex-col px-6 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm uppercase tracking-[0.18em]"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#reservas"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-accent px-5 py-3 text-center text-sm uppercase tracking-[0.18em] text-accent-foreground"
            >
              Reservar
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <img
        src={heroImg}
        alt="Interior romántico de Love Restaurant con árboles de cerezo rosa"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1280}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center text-white">
        <p className="animate-fade-in mb-6 font-script text-2xl text-accent md:text-3xl">
          Donde el amor florece
        </p>
        <h1 className="animate-fade-up font-display text-5xl font-light leading-[1.05] md:text-7xl lg:text-8xl">
          Una noche bajo el
          <br />
          <span className="italic text-gradient-gold">cerezo rosa</span>
        </h1>
        <p
          className="animate-fade-up mx-auto mt-8 max-w-2xl text-base font-light leading-relaxed text-white/90 md:text-lg"
          style={{ animationDelay: "0.2s" }}
        >
          El rincón más romántico de Villavicencio. Cocina de autor, coctelería única y la atmósfera
          mágica que estabas buscando para celebrar lo importante.
        </p>
        <div
          className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ animationDelay: "0.4s" }}
        >
          <a
            href="#reservas"
            className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-rose-deep to-primary px-10 py-4 text-sm uppercase tracking-[0.22em] text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 hover:shadow-2xl"
          >
            Reservar una Mesa
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
          <a
            href="#menu"
            className="rounded-full border border-white/40 px-10 py-4 text-sm uppercase tracking-[0.22em] text-white backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            Ver el menú
          </a>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-float text-white/80">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-[0.3em]">Descubre</span>
          <span className="h-12 w-px bg-white/60" />
        </div>
      </div>
    </section>
  );
}

function Essence() {
  return (
    <section id="esencia" className="relative py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-12 md:gap-16">
        <div className="reveal relative md:col-span-6 md:col-start-1">
          <div className="absolute -left-4 -top-4 h-32 w-32 rounded-full bg-rose/40 blur-3xl md:-left-8 md:-top-8 md:h-48 md:w-48" />
          <div className="relative overflow-hidden rounded-[2rem] shadow-elegant">
            <img
              src={aboutImg}
              alt="Fachada de Love Restaurant con árbol de cerezo"
              loading="lazy"
              className="h-[520px] w-full object-cover md:h-[640px]"
              width={1200}
              height={1400}
            />
          </div>
          <div className="absolute -bottom-8 -right-4 hidden rounded-2xl border border-accent/40 bg-card p-6 shadow-soft md:block md:-right-8">
            <p className="font-script text-3xl text-primary">Desde 2019</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Villavicencio, Meta
            </p>
          </div>
        </div>
        <div className="reveal md:col-span-5 md:col-start-8">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Nuestra Esencia</p>
          <h2 className="mt-4 font-display text-4xl font-light leading-tight md:text-6xl">
            Un lugar pensado para <span className="italic text-primary">enamorarse</span>
          </h2>
          <div className="mt-6 h-px w-24 bg-gradient-gold" />
          <p className="mt-8 text-base leading-relaxed text-muted-foreground md:text-lg">
            Love Restaurant nació de una idea simple: crear el espacio más romántico de
            Villavicencio. Un refugio donde los cerezos en flor, las velas y la cocina
            cuidadosamente preparada se unen para convertir cada cena en un recuerdo imborrable.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            Aniversarios, pedidas de mano, primeras citas o simplemente un martes que merece ser
            celebrado. Aquí cada mesa tiene su propia historia.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { n: "5★", l: "Google Reviews" },
              { n: "+5k", l: "Cenas mágicas" },
              { n: "100%", l: "Hecho con amor" },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-3xl text-primary md:text-4xl">{s.n}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Menu() {
  const categories = Object.keys(menu);
  const [active, setActive] = useState(categories[0]);
  return (
    <section
      id="menu"
      className="relative bg-gradient-to-b from-background via-secondary/30 to-background py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="reveal text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Carta</p>
          <h2 className="mt-4 font-display text-4xl font-light md:text-6xl">
            Menú <span className="italic text-primary">de autor</span>
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-gold" />
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Cada plato es una declaración de amor a los ingredientes, a la técnica y a quien lo
            recibe.
          </p>
        </div>

        <div className="reveal mt-12 flex flex-wrap justify-center gap-2 md:gap-3">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-full px-6 py-3 text-xs uppercase tracking-[0.2em] transition-all md:text-sm ${
                active === c
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "border border-border bg-card text-foreground/70 hover:border-accent hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          {menu[active].map((item) => (
            <article
              key={item.name}
              className="group relative flex gap-6 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl md:h-40 md:w-40">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  width={800}
                  height={800}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                {item.tag && (
                  <span className="self-start rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-foreground">
                    {item.tag}
                  </span>
                )}
                <h3 className="mt-2 font-display text-2xl leading-tight">{item.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-auto flex items-end justify-between pt-3">
                  <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                  <span className="ml-3 font-display text-xl text-primary">{item.price}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const images = [
    { src: gallery1, h: "row-span-2" },
    { src: gallery2, h: "row-span-1" },
    { src: dish3, h: "row-span-1" },
    { src: gallery3, h: "row-span-2" },
    { src: dish2, h: "row-span-1" },
    { src: aboutImg, h: "row-span-1" },
  ];
  return (
    <section id="galeria" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="reveal text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Galería</p>
          <h2 className="mt-4 font-display text-4xl font-light md:text-6xl">
            Para <span className="italic text-primary">no olvidar</span>
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-gold" />
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Cada rincón pensado para la foto perfecta. Etiquétanos en{" "}
            <a
              href="https://instagram.com"
              className="text-primary underline-offset-4 hover:underline"
            >
              @loverestaurant.vvc
            </a>
          </p>
        </div>

        <div className="reveal mt-12 grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-xl ${img.h} ${i === 0 ? "col-span-2 row-span-2 lg:col-span-2" : ""}`}
            >
              <img
                src={img.src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-deep/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reservation() {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const date = String(data.get("date") || "").trim();
    const time = String(data.get("time") || "").trim();
    const guests = Number(data.get("guests") || 2);
    const occasion = String(data.get("occasion") || "Cena romántica").trim();
    const notes = String(data.get("notes") || "").trim();

    if (name.length < 2 || name.length > 80) return toast.error("Por favor ingresa tu nombre.");
    if (!/^[+\d\s()-]{7,20}$/.test(phone)) return toast.error("Teléfono no válido.");
    if (!date || !time) return toast.error("Por favor completa fecha y hora.");

    setSubmitting(true);
    setTimeout(() => {
      const reservations = getReservations();
      const nextReservation = createReservation({
        name,
        phone,
        date,
        time,
        guests,
        occasion,
        notes,
      });
      saveReservations([nextReservation, ...reservations]);
      setSubmitting(false);
      toast.success("¡Reserva enviada! Te contactaremos para confirmar.");
      (e.target as HTMLFormElement).reset();
    }, 800);
  };

  return (
    <section id="reservas" className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 via-background to-rose/30" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-2 md:gap-16">
        <div className="reveal">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Reservas</p>
          <h2 className="mt-4 font-display text-4xl font-light leading-tight md:text-6xl">
            Aparta tu <span className="italic text-primary">momento</span>
          </h2>
          <div className="mt-6 h-px w-24 bg-gradient-gold" />
          <p className="mt-8 text-muted-foreground">
            Reservamos cada mesa con detalle. Cuéntanos sobre la ocasión y prepararemos todo para
            que sea perfecta.
          </p>
          <div className="mt-10 space-y-4 text-sm">
            <Info label="Horario" value="Mar — Dom · 5:00 PM – 12:00 AM" />
            <Info label="Dirección" value="Cl. 19 #40-14, Villavicencio, Meta" />
            <Info label="Reservas" value="+57 320 9837444" />
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="reveal rounded-3xl border border-border bg-card/80 p-6 shadow-elegant backdrop-blur-sm md:p-10"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre" name="name" type="text" required maxLength={80} />
            <Field label="Teléfono" name="phone" type="tel" required maxLength={20} />
            <Field label="Fecha" name="date" type="date" required />
            <Field label="Hora" name="time" type="time" required />
            <Field
              label="Personas"
              name="guests"
              type="number"
              min={1}
              max={20}
              defaultValue={2}
              required
            />
            <div className="flex flex-col">
              <label className="mb-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Ocasión
              </label>
              <select
                name="occasion"
                className="rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
              >
                <option>Cena romántica</option>
                <option>Aniversario</option>
                <option>Cumpleaños</option>
                <option>Primera cita</option>
                <option>Pedida de mano</option>
                <option>Otro</option>
              </select>
            </div>
          </div>
          <div className="mt-5">
            <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Notas (opcional)
            </label>
            <textarea
              name="notes"
              rows={3}
              maxLength={500}
              className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
              placeholder="Alergias, mesa preferida, sorpresas…"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-rose-deep to-primary px-10 py-4.5 text-sm uppercase tracking-[0.22em] text-primary-foreground shadow-elegant transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            {submitting ? "Enviando…" : "Solicitar reserva"}
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Te confirmaremos por WhatsApp en menos de 1 hora.
          </p>
        </form>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="mt-1 h-px w-8 shrink-0 bg-accent" />
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-foreground">{value}</p>
      </div>
    </div>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <div className="flex flex-col">
      <label className="mb-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      <input
        {...rest}
        className="rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
      />
    </div>
  );
}

function Testimonials() {
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="bg-gradient-to-b from-background to-secondary/40 py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="reveal text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Testimonios</p>
          <h2 className="mt-4 font-display text-4xl font-light md:text-6xl">
            Historias de <span className="italic text-primary">amor</span>
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-gold" />
        </div>

        <div className="reveal mt-14 overflow-hidden">
          <div
            ref={trackRef}
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${idx * 100}%)` }}
          >
            {testimonials.map((t) => (
              <div key={t.name} className="w-full shrink-0 px-4">
                <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-soft md:p-12">
                  <div className="flex justify-center gap-1 text-accent">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <span key={i} className="text-xl">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="mt-6 font-display text-xl italic leading-relaxed text-foreground/90 md:text-2xl">
                    “{t.text}”
                  </p>
                  <p className="mt-6 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    — {t.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                aria-label={`Testimonio ${i + 1}`}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-primary" : "w-1.5 bg-border"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      id="contacto"
      className="border-t border-border bg-gradient-to-b from-background to-secondary/30"
    >
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <h3 className="font-display text-3xl font-light md:text-4xl">
              Love<span className="text-gradient-gold"> Restaurant</span>
            </h3>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              El rincón más romántico de Villavicencio. Cenas mágicas bajo el árbol de cerezo rosa.
            </p>
            <div className="mt-6 flex gap-3">
              <Social href="https://instagram.com" label="Instagram">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </Social>
              <Social href="https://facebook.com" label="Facebook">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M13 22v-8h3l1-4h-4V7.5C13 6.4 13.4 6 14.5 6H17V2.2C16.6 2.1 15.3 2 14 2c-2.8 0-4 1.7-4 4v4H7v4h3v8h3z" />
                </svg>
              </Social>
              <Social href={WHATSAPP_URL} label="WhatsApp">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M20 4a10 10 0 0 0-16.5 11L2 22l7.2-1.5A10 10 0 1 0 20 4zm-8 18a8 8 0 0 1-4.1-1.1l-.3-.2-4.3.9.9-4.2-.2-.3A8 8 0 1 1 12 22zm4.5-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.1-.5 0a6.3 6.3 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.3c0 1.4 1 2.7 1.1 2.9s2 3.2 5 4.5c1.8.7 2.5.8 3.4.6.5-.1 1.4-.6 1.6-1.1s.2-1 .1-1.2-.3-.1-.5-.2z" />
                </svg>
              </Social>
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs uppercase tracking-[0.22em] text-accent">Visítanos</p>
            <p className="mt-4 text-sm">
              Cl. 19 #40-14
              <br />
              Villavicencio, Meta
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.22em] text-accent">Reservas</p>
            <p className="mt-2 text-sm">+57 320 9837444</p>
          </div>

          <div className="md:col-span-4">
            <div className="overflow-hidden rounded-2xl border border-border shadow-soft">
              <iframe
                title="Ubicación Love Restaurant"
                src="https://www.google.com/maps?q=Cl.+19+%2340-14,+Villavicencio,+Meta&output=embed"
                className="h-56 w-full md:h-64"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Love Restaurant · Villavicencio, Meta</p>
          <p className="font-script text-base text-primary">Hecho con amor ♥</p>
        </div>
      </div>
    </footer>
  );
}

function Social({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground/80 transition-all hover:-translate-y-0.5 hover:border-accent hover:text-primary"
    >
      {children}
    </a>
  );
}

function WhatsAppFloat() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-elegant animate-pulse-ring hover:scale-105 transition-transform md:bottom-7 md:right-7 md:h-16 md:w-16"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 md:h-8 md:w-8" fill="currentColor">
        <path d="M20 4a10 10 0 0 0-16.5 11L2 22l7.2-1.5A10 10 0 1 0 20 4zm-8 18a8 8 0 0 1-4.1-1.1l-.3-.2-4.3.9.9-4.2-.2-.3A8 8 0 1 1 12 22zm4.5-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.1-.5 0a6.3 6.3 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.3c0 1.4 1 2.7 1.1 2.9s2 3.2 5 4.5c1.8.7 2.5.8 3.4.6.5-.1 1.4-.6 1.6-1.1s.2-1 .1-1.2-.3-.1-.5-.2z" />
      </svg>
    </a>
  );
}
