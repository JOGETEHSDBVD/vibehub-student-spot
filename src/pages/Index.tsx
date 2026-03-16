import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import AboutSection from "@/components/AboutSection";
import FocusAreas from "@/components/FocusAreas";
import UpcomingEvents from "@/components/UpcomingEvents";
import CommunityMoments from "@/components/CommunityMoments";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <HeroSection />
    <FocusAreas />
    <UpcomingEvents />
    <CommunityMoments />
    <StatsSection />
    <AboutSection />
    <Footer />
  </div>
);

export default Index;
