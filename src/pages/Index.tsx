import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import heroBuilding from "@/assets/hero-building.png";
import aboutEvent from "@/assets/about-event.jpg";
import aboutStudent from "@/assets/about-student.jpg";

const Index = () => {
  const [authMode, setAuthMode] = useState<"signin" | "signup" | null>(null);
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 lg:px-20 pb-12 pt-4 md:pb-24 md:pt-8 mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 w-fit">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span className="text-xs font-bold uppercase tracking-wider">Join the University Pulse</span>
              </div>
              <h1 className="font-display text-5xl md:text-7xl leading-[1.1] text-foreground">
                Connect, Create, &amp; <span className="italic text-primary">Compete</span> at VibeHub
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                The ultimate university hub for Sports, Culture, and Entrepreneurship. Join a community that vibes with your passions and fuels your ambition.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/events" className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-base hover:shadow-lg transition-all flex items-center gap-2">
                  Explore Events <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <button onClick={() => setAuthMode("signup")} className="bg-card border border-border px-8 py-4 rounded-xl font-bold text-base hover:bg-muted transition-all flex items-center gap-2">
                  Take the Test <span className="material-symbols-outlined">quiz</span>
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-2xl">
                <img src={heroBuilding} alt="Cité des Métiers et des Compétences de la Région Casablanca-Settat" className="h-auto w-full object-cover" />
              </div>
              <div className="absolute -bottom-6 left-6 bg-card p-5 rounded-2xl shadow-xl border border-primary/20 hidden md:block">
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-primary">2026</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Membership Open</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Bar */}
        <section className="px-6 lg:px-20 py-12 bg-slate-900 text-white">
          <div className="mx-auto max-w-[1200px] grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {[
              { value: "500+", label: "Active Members" },
              { value: "25+", label: "Annual Events" },
              { value: "15+", label: "Skill Workshops" },
              { value: "2k+", label: "Participants" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center gap-2">
                <span className="text-4xl font-black text-primary">{stat.value}</span>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="px-6 lg:px-20 py-24 mx-auto max-w-[1200px]" id="about">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square rounded-2xl bg-primary/20 overflow-hidden bg-cover" style={{ backgroundImage: `url(${aboutEvent})` }} />
                <div className="aspect-square rounded-2xl bg-primary/20 overflow-hidden mt-8 bg-cover" style={{ backgroundImage: `url(${aboutStudent})` }} />
              </div>
            </div>
            <div className="flex flex-col gap-6 order-1 lg:order-2">
              <h2 className="font-display text-4xl md:text-5xl text-foreground">About VibeHub Club</h2>
              <div className="w-20 h-1.5 bg-primary rounded-full" />
              <p className="text-lg leading-relaxed text-muted-foreground">
                VibeHub is more than just a club; it's a movement within the university. We bridge the gap between passion and professional growth by providing a platform for students to excel in physical sports, express their cultural identities, and launch innovative entrepreneurial ventures.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Founded on the pillars of inclusivity and excellence, we empower students to step out of their comfort zones and lead the next generation of campus life.
              </p>
            </div>
          </div>
        </section>

        {/* Activity Areas */}
        <section className="px-6 lg:px-20 py-24 bg-primary/10" id="activities">
          <div className="mx-auto max-w-[1200px]">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl mb-4 text-foreground">Our Focus Areas</h2>
              <p className="text-muted-foreground">Find your tribe and explore your interests</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "sports_basketball", title: "Sports & Fitness", desc: "From competitive leagues to casual weekend matches, we promote physical excellence and teamwork.", color: "bg-blue-100 text-blue-600" },
                { icon: "theater_comedy", title: "Arts & Culture", desc: "Celebrating diversity through music, dance, theater, and fine arts. Express your creative soul.", color: "bg-orange-100 text-orange-600" },
                { icon: "rocket_launch", title: "Entrepreneurship", desc: "Incubating ideas and fostering leadership. Build your startup with the support of a like-minded community.", color: "bg-green-100 text-green-600" },
              ].map((area) => (
                <div key={area.title} className="group bg-card p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-border">
                  <div className={`w-14 h-14 ${area.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined text-3xl">{area.icon}</span>
                  </div>
                  <h3 className="font-display text-2xl mb-4 text-foreground">{area.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{area.desc}</p>
                  <a className="text-sm font-bold flex items-center gap-2 hover:text-primary transition-colors" href="#">Learn More <span className="material-symbols-outlined text-sm">arrow_outward</span></a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="px-6 lg:px-20 py-24 mx-auto max-w-[1200px]" id="events">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-display text-4xl md:text-5xl mb-2 text-foreground">Upcoming Events</h2>
              <p className="text-muted-foreground">Mark your calendars for the hottest dates on campus</p>
            </div>
            <Link to="/events" className="hidden md:flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors">
              View Full Calendar <span className="material-symbols-outlined">calendar_month</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { date: "Oct 12, 2024", title: "Annual Vibe Gala Night", desc: "A celebration of talent, culture, and achievements of our members throughout the semester.", tag: "Culture", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXVEltJ5oes7ogP5736ERWgkXcxpCehkCQlZxNYYbV3QgfepJoljKd48i89xAK5a9M7veEEhH_ZWmPX2u6KNUz616qLzBSwRFJeun3n0UUctCqlN4Mpo2yNH97PlPNsgBbvGqdzLQ6VSdAtGNEc3SX_jhtiRvLMwvXq2PhF4SUstu-0_te7w-6FgXRBWOTA0I0DkEF4Zrpi3d03O4w1iewoV6ru0F7SDVCGy__5P1Wc-8FByn9xiuXppDqi-FhIfe7b_Zm1B0aY1cq" },
              { date: "Oct 18, 2024", title: "Start-up Pitch Deck Workshop", desc: "Learn how to craft winning presentations with guest mentors from the local tech hub.", tag: "Entrepreneurship", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMWz1AjuPPJOF25OC8d-u3wJAljoV69Qj7ORGwdwjIy4vtdLB3hihyRY0BQa-TLDp9iWgaYxF8ZVYlr1y1LON043ApXu9knyfh9KLj3HGvHKMcAVVuypEcaGffOXfdIAlxsRG5xG7UtfWTFR5DOs1F66VAhmJrpA1Fc9UiXqQ_TVJfnx1R1gO2EjRxwMTgwQEDvS5_1ihJ-hBF8h7foiSTXwii-xZtr3kMGlXAiMfnrWagd_fAfjKGF4WEoqtE1UC6hVVkE6BPcVBB" },
              { date: "Oct 25, 2024", title: "Intra-University Cup", desc: "The most anticipated basketball tournament of the year. Bring your team spirit!", tag: "Sports", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDej98NG-WsX0ys36nWo7lMfFWvHtYdavtBG68MYF4R6iyu0xkr3URjfH0_ceP1vdrlQQmahKVvOpYIgls4Xwhx_lY0Q90XaCHTG49r3VkLNbCmPfXTnMXb42xYboHuLfNvlFHha_RyO43VPabPs8bIsMPsEkGS3qf3z834Skzc7uC8s1-uRCf5pfArXv5Okw3kmnA0FiuX-SQOTJHCKhc0I4Hj2dgQmRBDR9jUod96eWw5aqa11CHaom4txHNcglsu4xg_SbbA0xyJ" },
            ].map((event) => (
              <div key={event.title} className="flex flex-col rounded-2xl overflow-hidden border border-border bg-card group">
                <div className="h-48 overflow-hidden bg-muted">
                  <div className="w-full h-full group-hover:scale-105 transition-transform duration-500 bg-cover bg-center" style={{ backgroundImage: `url('${event.img}')` }} />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary mb-3">
                    <span className="material-symbols-outlined text-sm">calendar_today</span> {event.date}
                  </div>
                  <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors text-foreground">{event.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.desc}</p>
                  <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                    <span className="text-xs font-medium bg-muted px-3 py-1 rounded-full uppercase tracking-tighter">{event.tag}</span>
                    <button className="text-sm font-bold flex items-center">RSVP</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Community Gallery */}
        <section className="px-6 lg:px-20 py-24 bg-muted/50" id="gallery">
          <div className="mx-auto max-w-[1200px]">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl mb-4 text-foreground">Community Moments</h2>
              <p className="text-muted-foreground">Glimpses into our vibrant club life</p>
            </div>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
              {[
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBj2KDXPAmcWsTtBy-OFDE0QgaC6GhvQdgiZ7_7jOP3qGjpqlVyritfUPNwuucWxpEJNnJBPm9Q3-OoszmIGrZca2XI8Nd7LEKRCj7s0Mq7rP-faE7DicDkt1yn2jOKTgjnUbj4yTBfE9UZjYQeL55UKdl4jHw4A-8JvbJukNU15upihMc3Imxh4lSc7ciZ_-7zxDxACR-WmtN8f3bX60mFugrs6MGLeWcCDASHbOl04yAp5EFvFoFdJ8d-j2lPEyi16VxbV_jKFDbB",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCo6wUEJu2rIcJCyh5szyQ8bXOAT4RD8a5QUFKFN6673Q23TmN5CvOMEYcalfgfJn_dgB5pOY52RJ2C66IQYA0GHI8i38Z9fK-cT7Upw7fBU_ijg16lR_uuy7-47Mc6EL4s4ci3KIQlSPuW20NQnDsQiHsLmW4VkImnRywRLvvBq2LbBhNADHLHJ0T-bRTxDfZXV2--KiV-NKOr-bJI0JIIGLSuRequUsTN8rLi_qLYrdhXEzl42KrE_p3mdq8YxYbeekFAFEdYuF7K",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCkPnTpHa7ftxKP2kT8YsN-4YIEt8vq_WafAeyB1743cYHk-YQtQ4o1IdpCs3eUVSXfWmCtyBMb4h9wkF5LpVosxPXee61C8K4ro7JaxBcrLM1h4Z4Q1nkdaeZCF1ITTJJRZ8ya7pUKNZ1GQzmbYmkY55Y3u1v7H8EuhPhEY22alTs0fPvi7OssNCuclQm_GFfoyHUISpuwj_FOk6ssNITDyGRhXyub-M0XTUl-tA30Z_VqMUVRHAuWdp7sdYgNrRAf_kIlgBcUHHgx",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCBVkhDUv1M0bsHhQ4FVRQ_fm2IpZoK3LA6Oeqao85ZYwBftVPZCX02ZAFkh72pAE554xwuFVOw0xzAW7d3GUUn0w4x25BQcYkFRnLpZSkD2129it4ckY4pbogpG524OqlyrgTxKMLQUFr9ZaLVxMJhqdslCvnAWnFAWHMhreUkg5OYnA6xMNJcdVsWhoSRsoOCgKZM4bgf1R9Fudsk2e62yJhhpgYUcnCmrFCIDaJix5WZOyQvPzCQGmfm9vptvU58DXsRRelCKG3y",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBIHo4cz8MBsBwXkbYtxGlptNq3kNxp6i81pnwhPmo3QaeKgZgkIR-riJ6T8WNGDKKqJPuoQNNwY6NfKHeNlAiTJxo-aYglewtD1p98z0hgWTtiUE2PijAAmu9LPk_8EpmkaLGAeERHd7QusaO5rMnVwQcfcH2tqiERuRdLXlOoiszywqS3tmTYW3nUatCeIGCNYHW4bAfEPFT1r1PIuuGVgOzsKUdIDgm-IcKJl-yUq6Gwnhm7eI6EUqyoBpFTeWQlzliEA0poUmlR",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBFyufQkpTO5GyPnT2KFT_vXZLVa07e0JfCfTnbaUyUyYzFtuPE5uJXDHDiblj217z6DN2tDsmC_szk_Ikb640NpiBi3ISDI6dcwDjzFiYUoJAz5b_ydK8-Sy5zNU1hlWeT11gRKErpXqjFJoeF2JZ18a54o0PYUPGpiVcWHaU67dFHPOLjItqzci0yM42RlCAiqYAuBSiWVEq1lAJI5VeHcGORUTPxyM1-qeYIFV5kk5kMXldpZ-C1ceC0roX2_h8WsQHYUbu-9LJU",
              ].map((src, i) => (
                <div key={i} className="break-inside-avoid rounded-xl overflow-hidden shadow-sm">
                  <img alt={`Community moment ${i + 1}`} className="w-full" src={src} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <AuthModal
        isOpen={authMode !== null}
        mode={authMode ?? "signup"}
        onClose={() => setAuthMode(null)}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />
    </div>
  );
};

export default Index;
