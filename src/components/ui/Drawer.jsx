import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

export function Drawer({ isOpen, onClose, title, children, side = "right", width = "420px" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sideStyles = {
    right: { right: 0, top: 0, bottom: 0 },
    left: { left: 0, top: 0, bottom: 0 },
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--surface-overlay)",
        zIndex: "var(--z-drawer)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: "fixed",
          ...sideStyles[side],
          width: "100%",
          maxWidth: width,
          background: "var(--surface-primary)",
          boxShadow: "var(--shadow-xl)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: `slide-in-${side} var(--transition-slow) forwards`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--space-4) var(--space-5)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          <h2 className="text-h2">{title}</h2>
          <Button variant="ghost" size="sm" iconOnly onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </Button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-5)" }}>
          {children}
        </div>
      </aside>
    </div>
  );
}
