import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import aboutCultural from "@/assets/about-cultural.png";
import aboutSports from "@/assets/about-sports.png";
import aboutEntrepreneurial from "@/assets/about-entrepreneurial.png";

const panels = [
  {
    image: aboutCultural,
    title: "Our Story",
    text: "We noticed a gap. People have the drive to build, connect, and grow, but the tools we use to organize ourselves are often chaotic. VibeHub was created as a clean, centralized space to bring ideas and people together without the friction. It is a reliable system that makes collaboration smooth and effortless.",
    accent: "primary",
  },
  {
    image: aboutSports,
    title: "The Big Five: Clarity & Alignment",
    text: "We integrated the Big Five personality model because we believe in the power of self-awareness. It maps how you naturally approach challenges. We use this data to help you navigate, pointing you toward the projects, roles, and teams that naturally fit how you operate.",
    accent: "orange",
  },
  {
    image: aboutEntrepreneurial,
    title: "Our Vision",
    text: "Our vision is strictly practical: empower every student to lead, build, and perform at their peak. No fluff, no empty promises. Just a well-designed system where your focus remains entirely on getting the work done.",
    accent: "primary",
  },
];

/* ── Desktop: horizontal-scroll panels ── */
const DesktopPanels = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={containerRef} className="hidden md:block relative" style={{ height: "300vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {panels.map((panel, i) => {
          const start = i / panels.length;
          const end = (i + 1) / panels.length;
          const mid = (start + end) / 2;

          const clipFrom = i === 0 ? 0 : 33.33 * i;
          const clipTo = i === panels.length - 1 ? 100 : 33.33 * (i + 1);

          // Each panel expands from its slice to full width
          const clipLeft = useTransform(scrollYProgress, [start, mid], [clipFrom, 0]);
          const clipRight = useTransform(scrollYProgress, [start, mid], [clipTo, 100]);
          const overlayOpacity = useTransform(scrollYProgress, [start, start + 0.05, mid - 0.05, mid, end - 0.05, end], [0, 0, 0.75, 0.75, 0.75, 0]);
          const textOpacity = useTransform(scrollYProgress, [start + 0.08, mid], [0, 1]);
          const textY = useTransform(scrollYProgress, [start + 0.08, mid], [60, 0]);
          const imgY = useTransform(scrollYProgress, [start, end], [-30, 30]);
          const zIndex = useTransform(scrollYProgress, [start - 0.01, start, end, end + 0.01], [0, 30, 30, 0]);

          return (
            <motion.div
              key={i}
              className="absolute inset-0"
              style={{
                clipPath: useTransform(
                  [clipLeft, clipRight],
                  ([l, r]) => `inset(0 ${100 - (r as number)}% 0 ${l as number}%)`
                ),
                zIndex,
              }}
            >
              {/* Parallax image */}
              <motion.img
                src={panel.image}
                alt={panel.title}
                className="absolute inset-0 w-full h-full object-cover scale-110"
                style={{ y: imgY }}
              />

              {/* Glass overlay */}
              <motion.div
                className="absolute inset-0 backdrop-blur-xl"
                style={{
                  opacity: overlayOpacity,
                  background: "linear-gradient(135deg, hsla(220,26%,14%,0.7), hsla(220,26%,14%,0.85))",
                }}
              />

              {/* Accent glow */}
              <div
                className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none ${
                  panel.accent === "orange" ? "bg-orange-500/20" : "bg-primary/20"
                }`}
              />

              {/* Text content */}
              <motion.div
                className="absolute inset-0 flex items-end justify-center px-8 pb-16"
                style={{ opacity: textOpacity, y: textY }}
              >
                <div className="max-w-xl text-center">
                  <span className={`text-sm font-bold uppercase tracking-[0.3em] ${
                    panel.accent === "orange" ? "text-orange-400" : "text-primary"
                  }`}>
                    0{i + 1}
                  </span>
                  <h2 className="mt-4 font-display text-5xl lg:text-6xl text-white leading-tight">
                    {panel.title}
                  </h2>
                  <p className="mt-6 text-lg leading-relaxed text-white/80">
                    {panel.text}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          );
        })}

        {/* Initial 3-panel preview (visible before scroll) */}
        <motion.div
          className="absolute inset-0 grid grid-cols-3 gap-1 pointer-events-none"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.08], [1, 0]),
          }}
        >
          {panels.map((panel, i) => (
            <div key={i} className="relative overflow-hidden">
              <img src={panel.image} alt={panel.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-8 left-6 right-6">
                <span className={`text-xs font-bold uppercase tracking-[0.3em] ${
                  panel.accent === "orange" ? "text-orange-400" : "text-primary"
                }`}>
                  0{i + 1}
                </span>
                <h3 className="mt-2 text-2xl font-display text-white">{panel.title}</h3>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

/* ── Mobile: vertical fade-in cards ── */
const MobilePanel = ({ panel, index }: { panel: typeof panels[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className="relative h-[85vh] overflow-hidden rounded-2xl"
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.1 }}
    >
      <img src={panel.image} alt={panel.title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-transparent" />
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-[120px] pointer-events-none ${
          panel.accent === "orange" ? "bg-orange-500/25" : "bg-primary/25"
        }`}
      />
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <span className={`text-xs font-bold uppercase tracking-[0.3em] ${
          panel.accent === "orange" ? "text-orange-400" : "text-primary"
        }`}>
          0{index + 1}
        </span>
        <h2 className="mt-3 font-display text-3xl text-white">{panel.title}</h2>
        <p className="mt-4 text-base leading-relaxed text-white/80">{panel.text}</p>
      </div>
    </motion.div>
  );
};

const AboutUs = () => (
  <div className="min-h-screen bg-dark-bg">
    <Navbar />

    {/* Hero intro */}
    <section className="relative flex items-center justify-center h-[50vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-bg/95 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[200px]" />
      <motion.div
        className="relative z-10 text-center px-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <span className="text-primary text-sm font-bold uppercase tracking-[0.4em]">About Us</span>
        <h1 className="mt-4 font-display text-5xl md:text-7xl text-dark-bg-foreground leading-tight">
          Built by Students,<br />for Students
        </h1>
        <p className="mt-4 text-lg text-dark-bg-foreground/60 max-w-md mx-auto">
          Three pillars. One mission. Scroll to discover.
        </p>
        <motion.div
          className="mt-8 flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary/40 flex items-start justify-center pt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
        </motion.div>
      </motion.div>
    </section>

    {/* Desktop panels */}
    <DesktopPanels />

    {/* Mobile panels */}
    <div className="md:hidden flex flex-col gap-6 px-4 py-12">
      {panels.map((panel, i) => (
        <MobilePanel key={i} panel={panel} index={i} />
      ))}
    </div>

    {/* Closing CTA */}
    <section className="py-24 text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="font-display text-4xl md:text-5xl text-dark-bg-foreground">
          Ready to Join the Movement?
        </h2>
        <p className="mt-4 text-dark-bg-foreground/60 max-w-lg mx-auto">
          Whether you're an athlete, artist, or entrepreneur — there's a place for you here.
        </p>
        <a
          href="/events"
          className="inline-block mt-8 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-bold active:shadow-[0_0_24px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_24px_hsl(var(--primary)/0.4)] transition-shadow touch-target"
        >
          Explore Events
        </a>
      </motion.div>
    </section>

    <Footer />
  </div>
);

export default AboutUs;
