import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
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
import Precificacao from "./pages/Precificacao";
import ConciliacaoBancaria from "./pages/ConciliacaoBancaria";
import DRE from "./pages/DRE";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/clientes"} component={Clientes} />
      <Route path={"/categorias"} component={Categorias} />
      <Route path={"/produtos"} component={Produtos} />
      <Route path={"/pedidos"} component={Pedidos} />
      <Route path={"/financeiro"} component={Financeiro} />
      <Route path={"/relatorios"} component={Relatorios} />
      <Route path={"/insights"} component={Insights} />
      <Route path={"/auditoria"} component={Auditoria} />
      <Route path={"/configuracoes"} component={Configuracoes} />
      <Route path={"/precificacao"} component={Precificacao} />
      <Route path={"/conciliacao-bancaria"} component={ConciliacaoBancaria} />
      <Route path={"/dre"} component={DRE} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
