import bentoHackathon from "@/assets/bento-hackathon.jpg";
import bentoCollab from "@/assets/bento-collab.jpg";
import bentoSocial from "@/assets/bento-social.jpg";
import bentoFestival from "@/assets/bento-festival.jpg";
import bentoPresentation from "@/assets/bento-presentation.jpg";

export interface GalleryTile {
  id: number;
  src: string;
  alt: string;
  label: string;
  className: string;
}

export interface HeroConfig {
  backgroundImage: string;
  title: string;
  titleAccent: string;
  subtitle: string;
}

export interface GalleryConfig {
  tiles: GalleryTile[];
  liveBaseNumber: number;
  autoFluctuate: boolean;
  hero: HeroConfig;
}

const STORAGE_KEY = "vibehub_gallery_config";

const defaultHero: HeroConfig = {
  backgroundImage: "",
  title: "Ignite Your",
  titleAccent: "Campus Life!",
  subtitle: "Experience the pulse of campus. From midnight hackathons to sunrise hikes, find your tribe and make every moment count.",
};

const defaultTiles: GalleryTile[] = [
  { id: 1, src: bentoHackathon, alt: "Hackathon in progress", label: "Hackathon Night", className: "col-span-2 row-span-2" },
  { id: 2, src: bentoCollab, alt: "Students collaborating", label: "Lab Sessions", className: "col-span-1 row-span-2" },
  { id: 3, src: bentoSocial, alt: "Social meetup", label: "Coffee & Chill", className: "col-span-1 row-span-1" },
  { id: 4, src: bentoPresentation, alt: "Campus presentation", label: "Keynote Talks", className: "col-span-1 row-span-1" },
  { id: 5, src: bentoFestival, alt: "Campus festival", label: "Festival Vibes", className: "col-span-2 row-span-1" },
];

export function loadGalleryConfig(): GalleryConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GalleryConfig;
      // Merge with defaults to ensure className stays correct
      const tiles = defaultTiles.map((dt) => {
        const saved = parsed.tiles?.find((t) => t.id === dt.id);
        return saved ? { ...dt, src: saved.src, alt: saved.alt, label: saved.label } : dt;
      });
      return {
        tiles,
        liveBaseNumber: parsed.liveBaseNumber ?? 249,
        autoFluctuate: parsed.autoFluctuate ?? true,
        hero: parsed.hero ? { ...defaultHero, ...parsed.hero } : defaultHero,
      };
    }
  } catch {
    // ignore
  }
  return { tiles: defaultTiles, liveBaseNumber: 249, autoFluctuate: true, hero: defaultHero };
}

export function saveGalleryConfig(config: GalleryConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export { defaultTiles, defaultHero };
