import React, { useEffect, useState } from "react";
// Importaciones de Firebase para la autenticación y la inicialización de la aplicación
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';

// --- BRAND CONFIG ---
// Ruta de la imagen del logo (reemplaza con la ruta real de tu logo SVG/PNG)
const LOGO_SRC = "https://placehold.co/36x36/0000FF/FFFFFF?text=TB"; // Marcador de posición para el logo
// Clases de Tailwind CSS para el estilo del botón principal
const PRIMARY_BTN = "bg-blue-600 hover:bg-blue-700 text-white";
// Clases de Tailwind CSS para el estilo del botón "ghost"
const GHOST_BTN = "border border-blue-600 text-blue-700 hover:bg-blue-50";
// Clases de Tailwind CSS para el color del texto principal
const PRIMARY_TEXT = "text-blue-700";
// Clases de Tailwind CSS para el color del borde principal
const PRIMARY_BORDER = "border-blue-600";
// Clases de Tailwind CSS para el estilo del distintivo (badge) principal
const PRIMARY_BADGE = "bg-blue-600 text-white";

// ---- CONFIGURACIÓN DE LA APP ----
// Nombre de usuario de Cal.com para la integración de reservas
const CAL_USERNAME = "tommybox";
// Enlace de WhatsApp para comunicación directa
const WHATSAPP_LINK = "https://wa.me/56912345678";

// Configuración de Firebase (proporcionada por el entorno)
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Inicializa la aplicación y los servicios de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- Componentes de UI de ayuda ---
const Container = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8">{children}</div>
);

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="text-center mb-10">
    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
    {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
  </div>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className={`rounded-2xl border ${PRIMARY_BORDER} p-6 shadow-sm bg-white/80 backdrop-blur`}>
    {children}
  </div>
);

const Button = ({
  children,
  onClick,
  href,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  href?: string;
  variant?: "primary" | "ghost";
}) => {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium transition";
  const map = {
    primary: PRIMARY_BTN,
    ghost: GHOST_BTN,
  };
  if (href)
    return (
      <a className={`${base} ${map[variant]}`} href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  return (
    <button className={`${base} ${map[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
};

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${PRIMARY_BADGE}`}>{children}</span>
);

// Modal de autenticación para inicio de sesión de Firebase (anónimo o con token)
const AuthModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Función para manejar la autenticación con Firebase
  const handleAuth = async () => {
    setLoading(true);
    setMessage("");
    try {
      if (initialAuthToken) {
        await signInWithCustomToken(auth, initialAuthToken);
        setMessage("¡Sesión iniciada correctamente!");
      } else {
        await signInAnonymously(auth);
        setMessage("Sesión iniciada de forma anónima.");
      }
      onClose();
    } catch (error: any) {
      console.error("Error de autenticación de Firebase:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Inicia sesión</h3>
          <button className="text-sm opacity-70 hover:opacity-100" onClick={onClose}>
            Cerrar
          </button>
        </div>
        {message && <p className="text-sm mb-4">{message}</p>}
        <p className="text-sm mb-4">
          Puedes iniciar sesión de forma anónima para explorar la aplicación.
        </p>
        <Button onClick={handleAuth}>{loading ? "Iniciando sesión..." : "Iniciar sesión / Continuar"}</Button>
      </div>
    </div>
  );
};

// Modal de reservas con incrustación de Cal.com
const BookingModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-2 md:p-6">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-2 md:p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <h3 className="text-lg md:text-xl font-semibold">Agenda tu sesión</h3>
          <button className="text-sm opacity-70 hover:opacity-100" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <div className={`aspect-video w-full overflow-hidden rounded-xl border ${PRIMARY_BORDER}`}>
          {/* Incrustación de Cal.com para programar citas */}
          <iframe
            src={`https://cal.com/${CAL_USERNAME}?hide_event_type_details=1&hide_gdpr_banner=1`}
            className="h-full w-full"
            frameBorder={0}
          />
        </div>
      </div>
    </div>
  );
};

// Componente principal de la landing de TommyBox
export default function TommyBoxLanding() {
  const [authOpen, setAuthOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Barra de navegación */}
      <header className={`sticky top-0 z-40 border-b ${PRIMARY_BORDER} bg-white/90 backdrop-blur`}>
        <Container>
          <div className="flex h-16 items-center justify-between">
            {/* Logo y nombre de la aplicación */}
            <a href="#" className="flex items-center gap-3">
              <img src={LOGO_SRC} alt="Tommy Box" className="h-9 w-9 rounded-sm" />
              <span className={`font-semibold ${PRIMARY_TEXT}`}>Tommy Box</span>
            </a>
            {/* Botones de autenticación y reserva de usuario */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* Muestra el correo electrónico del usuario si ha iniciado sesión, o su UID si es anónimo */}
                  <Badge>{user.email || user.uid || 'Invitado'}</Badge>
                  <Button variant="ghost" onClick={() => signOut(auth)}>Salir</Button>
                  <Button onClick={() => setBookingOpen(true)}>Agendar</Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => setAuthOpen(true)}>Ingresar</Button>
                  <Button onClick={() => setBookingOpen(true)}>Agendar</Button>
                </>
              )}
            </div>
          </div>
        </Container>
      </header>
      {/* Sección HERO */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${PRIMARY_BADGE}`}>
                Entrenamiento Personal en Puerto Montt
              </span>
              <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">
                Método Tommybox: Entrena para la vida
              </h1>
              <p className="mt-4 text-slate-600 text-lg">
                Sistema de entrenamiento funcional y consciente adaptable a cualquier edad y objetivo. Basado en evaluación inicial, seguimiento digital y progresión dinámica, tu plan se ajusta en cada sesión para priorizar técnica y seguridad.
              </p>
              <ul className="mt-4 list-disc list-inside text-slate-600">
                <li>Evaluación inicial: fuerza, movilidad, postura y control</li>
                <li>Registro digital de progreso con gráficos y métricas</li>
                <li>Adaptaciones según edad, capacidad y objetivos</li>
                <li>Uso de herramientas como TRX, kettlebells y macebells</li>
                <li>Filosofía: fuerza, movilidad y control aplicados a tu vida diaria</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => setBookingOpen(true)}>Agendar primera sesión</Button>
                <Button variant="ghost" href={WHATSAPP_LINK}>WhatsApp</Button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Cupos limitados. Cancelación/reagendo hasta 12 h antes.
              </p>
            </div>
            <div>
              <div className={`aspect-video w-full overflow-hidden rounded-2xl border ${PRIMARY_BORDER} bg-white shadow`}>
                <div className="flex h-full w-full items-center justify-center">
                  <div className="text-center p-6">
                    <p className={`text-sm ${PRIMARY_TEXT}`}>[Video de entrenamientos reales]</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
      {/* Sección PLANES */}
      <section className="py-12 md:py-16 bg-slate-50">
        <Container>
          <SectionTitle title="Planes" subtitle="Elige tu nivel de compromiso" />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Evaluación inicial", price: "$20.000", desc: "30 min. para definir tu plan", cta: "Agendar" },
              { name: "Mensual 4 sesiones", price: "$75.000 CLP", desc: "1 por semana", cta: "Agendar" },
              { name: "Mensual 8 sesiones", price: "$80.000 CLP", desc: "2 por semana", cta: "Agendar" },
              { name: "Mensual 12 sesiones", price: "$90.000 CLP", desc: "3 por semana", cta: "Agendar" },
            ].map((p) => (
              <Card key={p.name}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <span className={`text-xl font-bold ${PRIMARY_TEXT}`}>{p.price}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{p.desc}</p>
                <div className="mt-4"><Button onClick={() => setBookingOpen(true)}>{p.cta}</Button></div>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-600">
            El valor de la evaluación inicial se descuenta del plan mensual elegido.
          </p>
        </Container>
      </section>
      {/* PIE DE PÁGINA */}
      <footer className="mt-4 bg-blue-600 text-white">
        <Container>
          <div className="py-8 text-center text-sm">
            <div className="flex items-center justify-center gap-2">
              <span>© {new Date().getFullYear()} Tommy Box</span>
              <span>·</span>
              <a className="underline" href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
                Contacto
              </a>
            </div>
            <p className="mt-2 opacity-90">Hecho con dedicación en Puerto Montt</p>
          </div>
        </Container>
      </footer>
      {/* Modales */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}