import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { loadGalleryConfig, type GalleryTile } from "@/stores/galleryStore";

const BentoGallery = () => {
  const { t } = useTranslation();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryTile | null>(null);
  const [activeCount, setActiveCount] = useState(249);
  const [tiles, setTiles] = useState<GalleryTile[]>([]);

  useEffect(() => {
    const config = loadGalleryConfig();
    setTiles(config.tiles);
    setActiveCount(config.liveBaseNumber);

    if (config.autoFluctuate) {
      const interval = setInterval(() => {
        setActiveCount((prev) => {
          const delta = Math.floor(Math.random() * 7) - 3;
          return Math.max(config.liveBaseNumber - 4, Math.min(config.liveBaseNumber + 6, prev + delta));
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, []);

  if (!tiles.length) return null;

  return (
    <section className="px-6 lg:px-20 pt-16 pb-8 bg-secondary/50">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10">
          <h2 className="font-display text-4xl md:text-5xl mb-2 text-foreground">
            {t("gallery.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("gallery.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[180px] gap-3 md:gap-4">
          {tiles.map((tile) => (
            <motion.div
              key={tile.id}
              className={`relative overflow-hidden rounded-3xl cursor-pointer group ${tile.className} ${
                tile.id === 1 ? "ring-2 ring-offset-2 ring-offset-secondary/50 ring-primary/40" : ""
              }`}
              onMouseEnter={() => setHoveredId(tile.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setSelectedImage(tile)}
              animate={{
                scale: hoveredId === tile.id ? 1.03 : 1,
                opacity: 1,
              }}
              transition={{ duration: 0.3 }}
              whileTap={{ scale: 0.98 }}
            >
              <img src={tile.src} alt={tile.alt} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <span className="text-sm font-bold text-primary-foreground drop-shadow-md">{tile.label}</span>
              </div>
            </motion.div>
          ))}

          <motion.div
            className="relative overflow-hidden rounded-3xl bg-dark-bg flex flex-col items-center justify-center col-span-1 row-span-1"
            onMouseEnter={() => setHoveredId(99)}
            onMouseLeave={() => setHoveredId(null)}
            animate={{ opacity: hoveredId !== null && hoveredId !== 99 ? 0.6 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="relative flex h-4 w-4 mb-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{t("gallery.live")}</span>
            <span className="text-lg font-black text-dark-bg-foreground">
              <motion.span key={activeCount} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                {activeCount}+
              </motion.span>
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">{t("gallery.liveActive")}</span>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-md cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl shadow-2xl"
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
