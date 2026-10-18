import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import DemoPreview from "@/pages/DemoPreview";
import Studio from "@/pages/Studio";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path="/demo" component={DemoPreview} />
      <Route path="/" component={Studio} />
      <Route path="/painel" component={Studio} />
      <Route path="/empresa" component={Studio} />
      <Route path="/criador" component={Studio} />
      <Route path="/biblioteca" component={Studio} />
      <Route path="/calendario" component={Studio} />
      <Route path="/integracoes" component={Studio} />
      <Route path="/seguranca" component={Studio} />
      <Route path="/configuracoes" component={Studio} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
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
