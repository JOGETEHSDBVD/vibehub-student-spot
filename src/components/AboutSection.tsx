import aboutEvent from "@/assets/about-event.jpg";
import aboutStudent from "@/assets/about-student.jpg";

const AboutSection = () => (
  <section className="bg-background py-20">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex gap-4">
          <div className="overflow-hidden rounded-2xl border-4 border-accent/30 w-1/2">
            <img src={aboutEvent} alt="Event presentation" className="h-full w-full object-cover" />
          </div>
          <div className="overflow-hidden rounded-2xl w-1/2 mt-8">
            <img src={aboutStudent} alt="Student" className="h-full w-full object-cover" />
          </div>
        </div>

        <div>
          <h2 className="font-display text-4xl text-foreground">About VibeHub Club</h2>
          <div className="mt-3 h-1 w-16 rounded bg-primary" />
          <p className="mt-6 text-body-text leading-relaxed">
            VibeHub is more than just a club; it's a movement within the university. We bridge the gap between passion and professional growth by providing a platform for students to excel in physical sports, express their cultural identities, and launch innovative entrepreneurial ventures.
          </p>
          <p className="mt-4 text-body-text leading-relaxed">
            Founded on the pillars of inclusivity and excellence, we empower students to step out of their comfort zones and lead the next generation of campus life.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
