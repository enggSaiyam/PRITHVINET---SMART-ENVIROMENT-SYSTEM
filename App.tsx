import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useAppStore } from "@/store/useAppStore";
import { Layout } from "@/components/Layout";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Monitoring from "@/pages/Monitoring";
import Alerts from "@/pages/Alerts";
import Citizens from "@/pages/Citizens";
import AiCopilot from "@/pages/AiCopilot";
import Industries from "@/pages/Industries";
import ApiDocs from "@/pages/ApiDocs";
import Database from "@/pages/Database";
import Reports from "@/pages/Reports";
import LiveMap from "@/pages/LiveMap";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAppStore(s => s.token);
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!token) setLocation("/login");
  }, [token, setLocation]);

  if (!token) return null;
  
  return <Layout>{children}</Layout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/monitoring">
        <ProtectedRoute><Monitoring /></ProtectedRoute>
      </Route>
      <Route path="/alerts">
        <ProtectedRoute><Alerts /></ProtectedRoute>
      </Route>
      <Route path="/citizens">
        <ProtectedRoute><Citizens /></ProtectedRoute>
      </Route>
      <Route path="/ai-copilot">
        <ProtectedRoute><AiCopilot /></ProtectedRoute>
      </Route>
      <Route path="/industries">
        <ProtectedRoute><Industries /></ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute><Reports /></ProtectedRoute>
      </Route>
      <Route path="/map">
        <ProtectedRoute><LiveMap /></ProtectedRoute>
      </Route>
      <Route path="/database">
        <ProtectedRoute><Database /></ProtectedRoute>
      </Route>
      <Route path="/api-docs">
        <ProtectedRoute><ApiDocs /></ProtectedRoute>
      </Route>

      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-display font-bold text-foreground">404</h1>
            <p className="text-muted-foreground mt-2">Sector not found.</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
