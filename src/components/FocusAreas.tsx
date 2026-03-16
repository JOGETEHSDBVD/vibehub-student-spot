import { Dribbble, Theater, Rocket, ArrowUpRight } from "lucide-react";

const areas = [
  {
    icon: <Dribbble size={24} className="text-primary" />,
    bg: "bg-primary/10",
    title: "Sports & Fitness",
    desc: "From competitive leagues to casual weekend matches, we promote physical excellence and teamwork.",
  },
  {
    icon: <Theater size={24} className="text-amber-600" />,
    bg: "bg-amber-100",
    title: "Arts & Culture",
    desc: "Celebrating diversity through music, dance, theater, and fine arts. Express your creative soul.",
  },
  {
    icon: <Rocket size={24} className="text-emerald-600" />,
    bg: "bg-emerald-100",
    title: "Entrepreneurship",
    desc: "Incubating ideas and fostering leadership. Build your startup with the support of a like-minded community.",
  },
];

const FocusAreas = () => (
  <section className="bg-secondary py-20">
    <div className="container mx-auto px-6 text-center">
      <h2 className="font-display text-4xl text-foreground">Our Focus Areas</h2>
      <p className="mt-2 text-body-text">Find your tribe and explore your interests</p>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {areas.map((a) => (
          <div key={a.title} className="rounded-2xl bg-background p-8 text-left shadow-sm transition-transform duration-200 hover:scale-[1.02]">
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${a.bg}`}>{a.icon}</div>
            <h3 className="mt-6 font-display text-xl text-foreground">{a.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-body-text">{a.desc}</p>
            <a href="#" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
              Learn More <ArrowUpRight size={14} />
            </a>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FocusAreas;
