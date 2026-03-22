import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import Index from "./pages/Index.tsx";
import Admin from "./pages/Admin.tsx";
import AdminEvents from "./pages/AdminEvents.tsx";
import AdminActiveEvents from "./pages/AdminActiveEvents.tsx";
import AdminMembers from "./pages/AdminMembers.tsx";
import AdminAnalytics from "./pages/AdminAnalytics.tsx";
import AdminAnnouncements from "./pages/AdminAnnouncements.tsx";
import AdminSettings from "./pages/AdminSettings.tsx";
import Events from "./pages/Events.tsx";
import EventDetail from "./pages/EventDetail.tsx";
import OrganizerProfile from "./pages/OrganizerProfile.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import EmailVerified from "./pages/EmailVerified.tsx";
import MyAccount from "./pages/MyAccount.tsx";
import NotFound from "./pages/NotFound.tsx";
const queryClient = new QueryClient();

const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect if verification tokens in hash (may be consumed quickly by Supabase)
    const hash = window.location.hash;
    const isVerificationCallback = hash.includes("type=signup") || hash.includes("type=email") || hash.includes("type=recovery");
    
    // Don't redirect if onboarding was already completed but email not yet verified
    const hasPendingOnboarding = !!localStorage.getItem("onboarding_data");
    
    if (!loading && user && profile && !profile.member_type && !isVerificationCallback && !hasPendingOnboarding && location.pathname !== "/onboarding" && location.pathname !== "/email-verified") {
      navigate("/onboarding", { replace: true });
    }
  }, [loading, user, profile, location.pathname, navigate]);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <OnboardingGuard>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/email-verified" element={<EmailVerified />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/organizer/:id" element={<OrganizerProfile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/active-events" element={<AdminActiveEvents />} />
              <Route path="/admin/members" element={<AdminMembers />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </OnboardingGuard>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
