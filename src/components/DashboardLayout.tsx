import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard, Users, Tags, Package, ShoppingCart,
  DollarSign, BarChart3, Brain, Shield, Settings,
  Menu, X, ChevronRight,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/clientes", label: "Clientes", icon: Users },
  { path: "/categorias", label: "Categorias", icon: Tags },
  { path: "/produtos", label: "Produtos", icon: Package },
  { path: "/pedidos", label: "Pedidos", icon: ShoppingCart },
  { path: "/financeiro", label: "Financeiro", icon: DollarSign },
  { path: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { path: "/insights", label: "Insights IA", icon: Brain },
  { path: "/auditoria", label: "Auditoria", icon: Shield },
  { path: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [location, nav] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">FE</span>
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight">Fernando ERP</h1>
            <p className="text-[10px] text-muted-foreground">Sistema de Gestao</p>
          </div>
          <button
            className="ml-auto lg:hidden p-1 rounded hover:bg-muted"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location === path;
            return (
              <button
                key={path}
                onClick={() => { nav(path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="h-3 w-3 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">FS</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">Fernando Silva</p>
              <p className="text-[10px] text-muted-foreground truncate">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar mobile */}
        <header className="h-16 border-b flex items-center px-6 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-3 font-semibold text-sm">Fernando ERP</span>
        </header>

        {/* Page content */}
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
