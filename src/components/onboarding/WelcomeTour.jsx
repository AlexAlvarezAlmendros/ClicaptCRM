import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Kanban, CheckSquare, Sparkles, ArrowRight, X } from "lucide-react";
import { Button } from "../ui/Button";

const TOUR_STORAGE_KEY = "leadflow_tour_completed";

const STEPS = [
  {
    icon: Sparkles,
    title: "¡Bienvenido a LeadFlow!",
    description:
      "Tu CRM inteligente para gestionar contactos, oportunidades de venta y tareas. Te guiamos en tus primeros pasos.",
    action: null,
  },
  {
    icon: Users,
    title: "1. Crea tu primer contacto",
    description:
      'Ve a la sección de Contactos y añade un lead o cliente. Puedes asignarle etiquetas, estado y datos de contacto.',
    action: { label: "Ir a Contactos", path: "/contactos" },
  },
  {
    icon: Kanban,
    title: "2. Configura tu pipeline",
    description:
      "Arrastra oportunidades entre las etapas del pipeline para visualizar tu embudo de ventas. Puedes personalizar las etapas en Configuración.",
    action: { label: "Ver Pipeline", path: "/pipeline" },
  },
  {
    icon: CheckSquare,
    title: "3. Organiza tus tareas",
    description:
      "Crea tareas de seguimiento vinculadas a contactos y oportunidades. Nunca pierdas el hilo de una conversación.",
    action: { label: "Ver Tareas", path: "/tareas" },
  },
];

/**
 * WelcomeTour — Multi-step onboarding overlay for first-time users.
 * Uses localStorage to remember if the tour was completed.
 * Placed inside AppLayout.
 */
export function WelcomeTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      // Small delay so the app renders first
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = currentStep.icon;

  function handleDismiss() {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setVisible(false);
  }

  function handleNext() {
    if (isLast) {
      handleDismiss();
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleAction() {
    if (currentStep.action) {
      navigate(currentStep.action.path);
      handleDismiss();
    }
  }

  return (
    <div className="welcome-tour__overlay" onClick={handleDismiss}>
      <div className="welcome-tour__card" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="welcome-tour__close" onClick={handleDismiss} aria-label="Cerrar tour">
          <X size={18} />
        </button>

        {/* Step indicator */}
        <div className="welcome-tour__steps">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`welcome-tour__dot ${i === step ? "welcome-tour__dot--active" : ""} ${
                i < step ? "welcome-tour__dot--done" : ""
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="welcome-tour__icon-wrap">
          <Icon size={32} />
        </div>

        {/* Content */}
        <h2 className="welcome-tour__title">{currentStep.title}</h2>
        <p className="welcome-tour__desc">{currentStep.description}</p>

        {/* Actions */}
        <div className="welcome-tour__actions">
          {currentStep.action && (
            <Button variant="outline" size="sm" onClick={handleAction}>
              {currentStep.action.label}
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={handleNext}>
            {isLast ? "¡Empezar!" : "Siguiente"}
            {!isLast && <ArrowRight size={14} style={{ marginLeft: 4 }} />}
          </Button>
        </div>

        {/* Skip */}
        {!isLast && (
          <button className="welcome-tour__skip" onClick={handleDismiss}>
            Saltar tour
          </button>
        )}
      </div>
    </div>
  );
}
