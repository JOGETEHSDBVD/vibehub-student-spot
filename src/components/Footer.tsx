import { Globe, Play, Share2 } from "lucide-react";

const Footer = () => (
  <footer className="bg-dark-bg pt-16 pb-8">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/20 text-primary font-bold text-sm">HL</div>
            <span className="text-lg font-bold text-dark-bg-foreground">VibeHub</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-dark-bg-foreground/70">
            The premier student-led organization for well-rounded university experiences.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm text-dark-bg-foreground/70">
            <li><a href="#" className="hover:text-primary transition-colors duration-200">About Us</a></li>
            <li><a href="#" className="hover:text-primary transition-colors duration-200">Events</a></li>
            <li><a href="#" className="hover:text-primary transition-colors duration-200">MBTI Test</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Support</h4>
          <ul className="mt-4 space-y-2 text-sm text-dark-bg-foreground/70">
            <li><a href="#" className="hover:text-primary transition-colors duration-200">FAQ</a></li>
            <li><a href="#" className="hover:text-primary transition-colors duration-200">Contact Support</a></li>
            <li><a href="#" className="hover:text-primary transition-colors duration-200">Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Connect</h4>
          <div className="mt-4 flex gap-3">
            {[Globe, Play, Share2].map((Icon, i) => (
              <a key={i} href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-dark-bg-foreground/20 text-dark-bg-foreground/70 transition-colors duration-200 hover:border-primary hover:text-primary">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-dark-bg-foreground/10 pt-6 text-center text-sm text-dark-bg-foreground/50">
        © 2024 VibeHub Club. Empowering university students.
      </div>
    </div>
  </footer>
);

export default Footer;
