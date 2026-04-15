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
import AdminPastEvents from "./pages/AdminPastEvents.tsx";
import AdminAnalytics from "./pages/AdminAnalytics.tsx";
import AdminAnnouncements from "./pages/AdminAnnouncements.tsx";
import AdminSettings from "./pages/AdminSettings.tsx";
import Events from "./pages/Events.tsx";
import EventDetail from "./pages/EventDetail.tsx";
import OrganizerProfile from "./pages/OrganizerProfile.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import EmailVerified from "./pages/EmailVerified.tsx";
import MyAccount from "./pages/MyAccount.tsx";
import MbtiTest from "./pages/MbtiTest.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ScanQR from "./pages/ScanQR.tsx";
import AdminGallery from "./pages/AdminGallery.tsx";
import StaffScanner from "./pages/StaffScanner.tsx";
import NotFound from "./pages/NotFound.tsx";
const queryClient = new QueryClient();

const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profileLoading, emailVerified, onboardingCompleted } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const isVerificationCallback = hash.includes("type=signup") || hash.includes("type=email") || hash.includes("type=recovery") || hash.includes("access_token");

    const excludedPaths = ["/onboarding", "/email-verified", "/reset-password"];
    const isExcluded = excludedPaths.includes(location.pathname);

    if (loading || profileLoading || !user || !emailVerified || isVerificationCallback || isExcluded) {
      return;
    }

    if (!onboardingCompleted) {
      navigate("/onboarding", { replace: true });
    }
  }, [loading, profileLoading, user, emailVerified, onboardingCompleted, location.pathname, navigate]);

  return <>{children}</>;
};

const AppRoutes = () => (
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
        <Route path="/admin/past-events" element={<AdminPastEvents />} />
        <Route path="/admin/members" element={<AdminMembers />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/account" element={<MyAccount />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/mbti-test" element={<MbtiTest />} />
        <Route path="/admin/scan-qr" element={<ScanQR />} />
        <Route path="/admin/gallery" element={<AdminGallery />} />
        <Route path="/my-account/scanner" element={<StaffScanner />} />
        <Route path="/checkin/:ticketId" element={<ScanQR />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </OnboardingGuard>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
