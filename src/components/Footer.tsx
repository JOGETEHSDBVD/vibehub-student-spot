import { Link } from "react-router-dom";
import logoClub from "@/assets/logo-club.png";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-16 px-6 lg:px-20">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1 flex flex-col gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoClub} alt="Club Logo" className="h-10 w-auto object-contain brightness-0 invert" />
            <h2 className="font-display text-2xl font-black tracking-tight">VibeHub</h2>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed">The premier student-led organization for well-rounded university experiences.</p>
        </div>
        <div>
          <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-accent">Quick Links</h5>
          <ul className="flex flex-col gap-4 text-sm text-slate-400">
            <li><Link className="hover:text-white transition-colors" to="#about">About Us</Link></li>
            <li><Link className="hover:text-white transition-colors" to="/events">Events</Link></li>
            <li><Link className="hover:text-white transition-colors" to="#">MBTI Test</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-accent">Support</h5>
          <ul className="flex flex-col gap-4 text-sm text-slate-400">
            <li><a className="hover:text-white transition-colors" href="#">FAQ</a></li>
            <li><a className="hover:text-white transition-colors" href="#">Contact Support</a></li>
            <li><a className="hover:text-white transition-colors" href="#">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-accent">Connect</h5>
          <div className="flex gap-3">
            <a className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors" href="#">
              <span className="material-symbols-outlined text-sm">public</span>
            </a>
            <a className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors" href="#">
              <span className="material-symbols-outlined text-sm">send</span>
            </a>
            <a className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors" href="#">
              <span className="material-symbols-outlined text-sm">share</span>
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl mt-12 pt-8 border-t border-slate-800 text-slate-500 text-sm text-center">
        © 2024 VibeHub Club. Empowering university students.
      </div>
    </footer>
  );
};

export default Footer;
