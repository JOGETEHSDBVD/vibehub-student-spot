const events = [
  { month: "OCT", day: "24", title: "Startup Pitch Night", location: "Innovation Hall • 6:00 PM" },
  { month: "OCT", day: "28", title: "Inter-Uni Basketball", location: "Sports Complex • 10:00 AM" },
];

const UpcomingEventsPanel = () => (
  <div className="rounded-xl border border-border bg-card p-5">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold text-foreground">Upcoming Events</h3>
      <button className="text-xs font-medium text-primary hover:underline">View all</button>
    </div>
    <div className="mt-4 space-y-4">
      {events.map((e) => (
        <div key={e.title} className="flex items-center gap-3">
          <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-red-50 text-center">
            <span className="text-[10px] font-bold uppercase text-red-400">{e.month}</span>
            <span className="text-lg font-bold leading-none text-red-500">{e.day}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{e.title}</p>
            <p className="text-xs text-muted-foreground">{e.location}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default UpcomingEventsPanel;
