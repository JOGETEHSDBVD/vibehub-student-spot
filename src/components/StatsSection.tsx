const stats = [
  { value: "500+", label: "Active Members" },
  { value: "25+", label: "Annual Events" },
  { value: "15+", label: "Skill Workshops" },
  { value: "2k+", label: "Participants" },
];

const StatsSection = () => (
  <section className="bg-dark-bg py-12">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-3xl md:text-4xl font-bold text-primary">{s.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-dark-bg-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
