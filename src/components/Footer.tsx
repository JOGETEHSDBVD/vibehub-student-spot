import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Instagram } from "lucide-react";
import logoBlue from "@/assets/logo-blue.png";
import logoWhite from "@/assets/logo-white.png";

const Footer = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isDarkPage = location.pathname === "/events" || location.pathname.startsWith("/events/");

  return (
    <footer className="bg-slate-900 text-white py-16 px-6 lg:px-20">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1 flex flex-col gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={isDarkPage ? logoWhite : logoBlue} alt="VibeHub Logo" className="h-10 w-auto object-contain" />
            <h2 className="font-display text-2xl font-black tracking-tight">VibeHub</h2>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed">{t("footer.tagline")}</p>
        </div>
        <div>
          <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-primary">{t("footer.quickLinks")}</h5>
          <ul className="flex flex-col gap-4 text-sm text-slate-400">
            <li><Link className="hover:text-white transition-colors" to="/about">{t("footer.aboutUs")}</Link></li>
            <li><Link className="hover:text-white transition-colors" to="/events">{t("nav.events")}</Link></li>
            <li><Link className="hover:text-white transition-colors" to="/mbti-test">{t("nav.mbtiTest")}</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-primary">{t("footer.support")}</h5>
          <ul className="flex flex-col gap-4 text-sm text-slate-400">
            <li><a className="hover:text-white transition-colors" href="#">{t("footer.faq")}</a></li>
            <li><a className="hover:text-white transition-colors" href="#">{t("footer.contactSupport")}</a></li>
            <li><a className="hover:text-white transition-colors" href="#">{t("footer.privacyPolicy")}</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-primary">{t("footer.connect")}</h5>
          <div className="flex gap-3">
            <a className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors" href="#">
              <span className="material-symbols-outlined text-sm">public</span>
            </a>
            <a className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors" href="https://www.instagram.com/vh__club/" target="_blank" rel="noopener noreferrer">
              <Instagram size={18} className="text-primary" />
            </a>
            <a className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors" href="#">
              <span className="material-symbols-outlined text-sm">share</span>
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl mt-12 pt-8 border-t border-slate-800 text-slate-500 text-sm text-center">
        {t("footer.copyright")}
      </div>
    </footer>
  );
};

export default Footer;
