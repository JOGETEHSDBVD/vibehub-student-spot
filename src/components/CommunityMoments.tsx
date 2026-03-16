import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";

const images = [g1, g2, g3, g4, g5, g6];

const CommunityMoments = () => (
  <section className="bg-secondary py-20">
    <div className="container mx-auto px-6 text-center">
      <h2 className="font-display text-4xl text-foreground">Community Moments</h2>
      <p className="mt-2 text-body-text">Glimpses into our vibrant club life</p>

      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((src, i) => (
          <div key={i} className="overflow-hidden rounded-2xl">
            <img src={src} alt={`Community moment ${i + 1}`} className="aspect-[4/3] w-full object-cover transition-transform duration-200 hover:scale-105" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default CommunityMoments;
