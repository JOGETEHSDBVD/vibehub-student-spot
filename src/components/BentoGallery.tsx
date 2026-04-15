import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import bentoHackathon from "@/assets/bento-hackathon.jpg";
import bentoCollab from "@/assets/bento-collab.jpg";
import bentoSocial from "@/assets/bento-social.jpg";
import bentoFestival from "@/assets/bento-festival.jpg";
import bentoPresentation from "@/assets/bento-presentation.jpg";

interface Tile {
  id: number;
  src: string;
  alt: string;
  label: string;
  className: string;
}

const tiles: Tile[] = [
  {
    id: 1,
    src: bentoHackathon,
    alt: "Hackathon in progress",
    label: "Hackathon Night",
    className: "col-span-2 row-span-2",
  },
  {
    id: 2,
    src: bentoCollab,
    alt: "Students collaborating",
    label: "Lab Sessions",
    className: "col-span-1 row-span-2",
  },
  {
    id: 3,
    src: bentoSocial,
    alt: "Social meetup",
    label: "Coffee & Chill",
    className: "col-span-1 row-span-1",
  },
  {
    id: 4,
    src: bentoPresentation,
    alt: "Campus presentation",
    label: "Keynote Talks",
    className: "col-span-1 row-span-1",
  },
  {
    id: 5,
    src: bentoFestival,
    alt: "Campus festival",
    label: "Festival Vibes",
    className: "col-span-2 row-span-1",
  },
];

const BentoGallery = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<Tile | null>(null);

  return (
    <section className="px-6 lg:px-20 pt-16 pb-8 bg-secondary/50">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10">
          <h2 className="font-display text-4xl md:text-5xl mb-2 text-foreground">
            CMC Moments
          </h2>
          <p className="text-muted-foreground">
            Glimpses into the digital heart of CMC
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[180px] gap-3 md:gap-4">
          {tiles.map((tile) => (
            <motion.div
              key={tile.id}
              className={`relative overflow-hidden rounded-3xl cursor-pointer group ${tile.className} ${
                tile.id === 1
                  ? "ring-2 ring-offset-2 ring-offset-secondary/50 ring-primary/40"
                  : ""
              }`}
              onMouseEnter={() => setHoveredId(tile.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setSelectedImage(tile)}
              animate={{
                scale: hoveredId === tile.id ? 1.03 : 1,
                opacity: hoveredId !== null && hoveredId !== tile.id ? 0.6 : 1,
              }}
              transition={{ duration: 0.3 }}
              whileTap={{ scale: 0.98 }}
            >
              <img
                src={tile.src}
                alt={tile.alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <span className="text-sm font-bold text-primary-foreground drop-shadow-md">
                  {tile.label}
                </span>
              </div>
            </motion.div>
          ))}

          {/* Live indicator tile */}
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-dark-bg flex flex-col items-center justify-center col-span-1 row-span-1"
            onMouseEnter={() => setHoveredId(99)}
            onMouseLeave={() => setHoveredId(null)}
            animate={{
              opacity: hoveredId !== null && hoveredId !== 99 ? 0.6 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <span className="relative flex h-4 w-4 mb-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
              Live
            </span>
            <span className="text-lg font-black text-dark-bg-foreground">
              249+
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              VibeHubbers Active
            </span>
          </motion.div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 backdrop-blur-sm cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
            />
            <motion.p
              className="absolute bottom-8 text-primary-foreground text-lg font-bold"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              {selectedImage.label}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default BentoGallery;
