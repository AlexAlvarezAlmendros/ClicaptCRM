import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { TrialBanner } from "../onboarding/TrialBanner";
import { WelcomeTour } from "../onboarding/WelcomeTour";
import { SubscriptionGateProvider } from "../onboarding/SubscriptionGate";
import "../../components/onboarding/TrialBanner.css";
import "../../components/onboarding/WelcomeTour.css";
import "../../components/onboarding/UpgradeWall.css";

export function AppLayout() {
  return (
    <SubscriptionGateProvider>
      <div className="app-layout">
        {/* Skip to content — Accessibility */}
        <a href="#main-content" className="skip-to-content">Ir al contenido principal</a>

        {/* Sidebar — Desktop & Tablet */}
        <aside className="app-layout__sidebar" aria-label="Barra lateral">
          <Sidebar />
        </aside>

        {/* Main content area */}
        <main className="app-layout__main">
          <TrialBanner />
          <Header />
          <div className="app-layout__content" id="main-content">
            <Outlet />
          </div>
        </main>

        {/* Bottom Nav — Mobile */}
        <BottomNav />

        {/* Onboarding tour — first-time users */}
        <WelcomeTour />
      </div>
    </SubscriptionGateProvider>
  );
}
