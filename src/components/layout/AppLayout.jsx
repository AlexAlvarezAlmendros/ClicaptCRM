import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export function AppLayout() {
  return (
    <div className="app-layout">
      {/* Sidebar — Desktop & Tablet */}
      <aside className="app-layout__sidebar">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <main className="app-layout__main">
        <Header />
        <div className="app-layout__content">
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav — Mobile */}
      <BottomNav />
    </div>
  );
}
