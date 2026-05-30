import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Home from "@/pages/Home";
import Chefs from "@/pages/Chefs";
import ChefProfile from "@/pages/ChefProfile";
import Cleaners from "@/pages/Cleaners";
import Shopping from "@/pages/Shopping";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import ProviderPanel from "@/pages/ProviderPanel";
import Signup from "@/pages/Signup";
import RegisterChef from "@/pages/RegisterChef";
import RegisterCleaner from "@/pages/RegisterCleaner";
import Login from "@/pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/chefs" component={Chefs} />
      <Route path="/chefs/:id" component={ChefProfile} />
      <Route path="/limpeza" component={Cleaners} />
      <Route path="/cleaners" component={Cleaners} />
      <Route path="/compras" component={Shopping} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/register/chef" component={RegisterChef} />
      <Route path="/register/cleaner" component={RegisterCleaner} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/prestador" component={ProviderPanel} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
