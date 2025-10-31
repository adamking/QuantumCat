import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QuantumSettingsProvider } from "@/contexts/QuantumSettingsContext";
import Home from "@/pages/home";
import Economics from "@/pages/economics";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useHashLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <WouterRouter hook={useHashLocation}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/economics" component={Economics} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <QuantumSettingsProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QuantumSettingsProvider>
  );
}

export default App;
