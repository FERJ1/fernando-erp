import { Route, Switch, Router } from "wouter";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import Clientes from "./pages/Clientes";
import Categorias from "./pages/Categorias";
import Produtos from "./pages/Produtos";
import Pedidos from "./pages/Pedidos";
import Financeiro from "./pages/Financeiro";
import Relatorios from "./pages/Relatorios";
import Insights from "./pages/Insights";
import Auditoria from "./pages/Auditoria";
import Configuracoes from "./pages/Configuracoes";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function App() {
  return (
    <Router base={base}>
      <Toaster position="top-right" richColors />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/clientes" component={Clientes} />
        <Route path="/categorias" component={Categorias} />
        <Route path="/produtos" component={Produtos} />
        <Route path="/pedidos" component={Pedidos} />
        <Route path="/financeiro" component={Financeiro} />
        <Route path="/relatorios" component={Relatorios} />
        <Route path="/insights" component={Insights} />
        <Route path="/auditoria" component={Auditoria} />
        <Route path="/configuracoes" component={Configuracoes} />
        <Route>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">404</h1>
              <p className="text-muted-foreground">Página não encontrada</p>
            </div>
          </div>
        </Route>
      </Switch>
    </Router>
  );
}
