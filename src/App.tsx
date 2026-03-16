import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import Admin from "./pages/Admin.tsx";
import AdminEvents from "./pages/AdminEvents.tsx";
import AdminMembers from "./pages/AdminMembers.tsx";
import AdminAnalytics from "./pages/AdminAnalytics.tsx";
import AdminAnnouncements from "./pages/AdminAnnouncements.tsx";
import AdminSettings from "./pages/AdminSettings.tsx";
import Events from "./pages/Events.tsx";
import NotFound from "./pages/NotFound.tsx";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/events" element={<Events />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/members" element={<AdminMembers />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/announcements" element={<AdminAnnouncements />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
