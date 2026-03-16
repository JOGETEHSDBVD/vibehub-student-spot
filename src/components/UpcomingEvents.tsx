import { Calendar, CalendarDays } from "lucide-react";
import eventGala from "@/assets/event-gala.jpg";
import eventWorkshop from "@/assets/event-workshop.jpg";
import eventBasketball from "@/assets/event-basketball.jpg";

const events = [
  { img: eventGala, date: "Oct 12, 2024", title: "Annual Vibe Gala Night", desc: "A celebration of talent, culture, and achievements of our members...", tag: "CULTURE" },
  { img: eventWorkshop, date: "Oct 18, 2024", title: "Start-up Pitch Deck Workshop", desc: "Learn how to craft winning presentations with guest mentors from the local tech...", tag: "ENTREPRENEURSHIP" },
  { img: eventBasketball, date: "Oct 25, 2024", title: "Intra-University Cup", desc: "The most anticipated basketball tournament of the year. Bring your tea...", tag: "SPORTS" },
];

const UpcomingEvents = () => (
  <section id="events" className="bg-background py-20">
    <div className="container mx-auto px-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-4xl text-foreground">Upcoming Events</h2>
          <p className="mt-2 text-body-text">Mark your calendars for the hottest dates on campus</p>
        </div>
        <a href="#" className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
          View Full Calendar <CalendarDays size={16} />
        </a>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((e) => (
          <div key={e.title} className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-transform duration-200 hover:scale-[1.02]">
            <img src={e.img} alt={e.title} className="h-48 w-full object-cover" />
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <Calendar size={14} /> {e.date}
              </div>
              <h3 className="mt-2 text-lg font-bold text-foreground">{e.title}</h3>
              <p className="mt-1 text-sm text-body-text">{e.desc}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase text-foreground">{e.tag}</span>
                <button className="text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200">RSVP</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default UpcomingEvents;
