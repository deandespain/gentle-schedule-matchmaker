import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Router, Route, Switch } from "wouter";
import Index from "./pages/Index";
import Caregivers from "./pages/Caregivers";
import Clients from "./pages/Clients";
import ScheduleOptions from "./pages/ScheduleOptions";
import CalendarView from "./pages/CalendarView";
import NotFound from "./pages/NotFound";



const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/caregivers" component={Caregivers} />
          <Route path="/clients" component={Clients} />
          <Route path="/schedule" component={ScheduleOptions} />
          <Route path="/calendar" component={CalendarView} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route component={NotFound} />
        </Switch>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
