// Asset manifest: every image path the site uses, with intrinsic size and alt text.
// Files live in /public (see scripts/assets/ for how they were produced). Update here when real studio assets arrive.
import type { BuddyPose, PackAsset, ShapeName } from "./types";
import type { FlavourKey } from "./keys";

type Img = { src: string; width: number; height: number; alt: string };

const pack = (file: string, w: number, h: number, photo: string | null, interim = false): PackAsset => ({
  cutout: `/packs/${file}.webp`, photo: photo ? `/packs/photos/${photo}.webp` : null, width: w, height: h, interim,
});
/** No real pack photo exists yet: components show the placeholder SVG (600x800, 3:4). */
const none = (): PackAsset => ({ cutout: null, photo: null, width: 600, height: 800, interim: false });

// Cut-outs are background-removed from the client's pack photos (pack + its bowl of snack).
// `interim: true` = the image is a different pack format (pillow/jar) than the product, reused from the same flavour's
// zipper/stand-up pack photo until a real pack shot exists.
const PERI = { f: "makhana-zipper-peri-peri", w: 578, h: 925, p: "makhana-peri" } as const;
const SALT = { f: "makhana-zipper-salt-pepper", w: 905, h: 764, p: "makhana-salt" } as const;

export const packAssets: Record<string, PackAsset> = {
  "dryfruits-raw-almonds": pack("dryfruits-raw-almonds", 475, 720, "dryfruits-raw-almonds"), // pack only (bowl was cropped by the photo edge)
  "dryfruits-raw-cashews": pack("dryfruits-raw-cashews", 802, 772, "dryfruits-raw-cashews"),
  "dryfruits-roasted-almonds": pack("dryfruits-roasted-almonds", 643, 655, "dryfruits-roasted-almonds"),
  "dryfruits-roasted-cashews": pack("dryfruits-roasted-cashews", 811, 695, "dryfruits-roasted-cashews"),
  // Makhana: Chatpataa, Black Salt, Berry Berry and Raw Makhana have NO photo of their own pack yet.
  "makhana-jar-chatpataa": none(),
  "makhana-pillow-chatpataa": none(),
  "makhana-zipper-chatpataa": none(),
  "makhana-zipper-black-salt": none(),
  "makhana-zipper-berry-berry": none(),
  "makhana-raw-1": none(),
  "makhana-zipper-peri-peri": pack(PERI.f, PERI.w, PERI.h, PERI.p),
  "makhana-pillow-peri-peri": pack(PERI.f, PERI.w, PERI.h, PERI.p, true),
  "makhana-jar-peri-peri": pack(PERI.f, PERI.w, PERI.h, PERI.p, true),
  "makhana-zipper-salt-pepper": pack(SALT.f, SALT.w, SALT.h, SALT.p),
  "makhana-pillow-salt-pepper": pack(SALT.f, SALT.w, SALT.h, SALT.p, true),
  "makhana-jar-salt-pepper": pack(SALT.f, SALT.w, SALT.h, SALT.p, true),
  "makhana-zipper-cheese-herbs": pack("makhana-zipper-cheese-herbs", 733, 830, "makhana-cheese"),
  "makhana-zipper-pudina": pack("makhana-zipper-pudina", 765, 748, "makhana-pudina"),
  // Popcorn photos show a stand-up pouch while the catalogue lists pillow packs: interim.
  "popcorn-butter": pack("popcorn-butter", 808, 676, "popcorn-butter", true),
  "popcorn-pudina": pack("popcorn-pudina", 813, 791, "popcorn-pudina", true),
  "popcorn-salted": pack("popcorn-salted", 805, 700, "popcorn-salted", true),
};

/** Placeholder pouch SVG (600x800) for a flavour with no real cut-out. */
export const placeholderPack = (flavourKey: FlavourKey): string => `/packs/placeholder/${flavourKey}.svg`;
export const PLACEHOLDER_SIZE = { width: 600, height: 800 } as const;

type BuddyEntry = { src: string; width: number; height: number; available: boolean; fallback?: BuddyPose };
const BUDDY_MISSING = { src: "", width: 0, height: 0, available: false } as const;
export const buddy: Record<BuddyPose, BuddyEntry> = {
  // Upscaled 4x from a 260x195 px source (soft at large sizes: keep it under ~400 px CSS width until a hi-res file exists).
  point: { src: "/brand/buddy/buddy-point.webp", width: 819, height: 735, available: true },
  // Sitting on a wooden block next to a bowl of makhana; left edge of the bowl is cropped by the source image.
  sit: { src: "/brand/buddy/buddy-sit.webp", width: 971, height: 666, available: true },
  peek: { ...BUDDY_MISSING, fallback: "point" },
  wave: { ...BUDDY_MISSING, fallback: "sit" },
  walk: { ...BUDDY_MISSING, fallback: "point" },
  thumbs: { ...BUDDY_MISSING, fallback: "point" },
  confused: { ...BUDDY_MISSING, fallback: "sit" },
  pop: { ...BUDDY_MISSING, fallback: "point" },
};

export const brand = {
  logo: { src: "/brand/logo.png", webp: "/brand/logo.webp", width: 362, height: 186, alt: "Yunch Bite" },
} as const;

export const photos = {
  factory: { src: "/photos/factory.webp", width: 1080, height: 700, alt: "Yunch Bite factory workers in yellow uniforms inspecting makhana on the production conveyor belt" },
  /** Banner with baked-in yellow text panel ("A Crunch Worth Sharing!") on the left. */
  familyLifestyle: { src: "/photos/family-lifestyle.webp", width: 1823, height: 675, alt: "A mother and daughter sharing a bowl of makhana at home" },
  /** Banner with baked-in headline text ("Ye Hai Aam Jindgi / Ye Hai Yunchy Jindgi"). */
  periVsEveryday: { src: "/photos/banner-peri-vs-everyday.webp", width: 1984, height: 852, alt: "A bored girl with chips versus a happy girl with a bowl of Peri-Peri Paradise makhana" },
  /** Collage with baked-in slogans. */
  collage: { src: "/photos/promotional-collage.webp", width: 836, height: 471, alt: "Yunch Bite snacking lifestyle collage" },
  /** Founder/brand banner with the old pack line-up and baked-in text. */
  aboutHero: { src: "/photos/about-hero.webp", width: 862, height: 570, alt: "Yunch Bite: crafted for every generation. 100% natural, roasted in olive oil, high in protein" },
  /** Transparent PNG-style cut-out: bowl of seasoned makhana with scattered kernels and a mint leaf. */
  makhanaBowl: { src: "/photos/makhana-bowl.webp", width: 1200, height: 896, alt: "Bowl of seasoned crunchy makhana with scattered foxnuts" },
  /** Empty podium showcase with two small old packs; low value, kept for reference. */
  productsHero: { src: "/photos/products-hero.webp", width: 794, height: 349, alt: "Yunch Bite products podium showcase" },
  avatarFemale: { src: "/photos/avatar-female.webp", width: 1024, height: 1024, alt: "Neha Sharma" },
} satisfies Record<string, Img>;

export const blogImages: Record<string, Img> = {
  "discover-our-range-of-healthy-snacks": {
    src: "/photos/blog/discover-our-range-of-healthy-snacks.webp", width: 1376, height: 768,
    // NOTE: the packs in this image carry a different brand ("Nature's Harvest"); replace before launch.
    alt: "Four snack pouches on a marble kitchen counter beside a bowl of makhana",
  },
  "healthy-snacking-habits-for-the-whole-family": {
    src: "/photos/blog/healthy-snacking-habits-for-the-whole-family.webp", width: 1376, height: 768,
    alt: "A mother and son sharing a bowl of snacks at a wooden kitchen table",
  },
  "popcorn-the-crunchy-snack-you-can-feel-good-about": {
    src: "/photos/blog/popcorn-the-crunchy-snack-you-can-feel-good-about.webp", width: 1376, height: 768,
    alt: "A wooden bowl of freshly popped popcorn with a little salt and butter",
  },
  "the-power-of-nuts-small-bite-big-benefits": {
    src: "/photos/blog/the-power-of-nuts-small-bite-big-benefits.webp", width: 1376, height: 768,
    alt: "A bowl of roasted almonds and cashews on a rustic wooden table",
  },
  "why-makhana-is-the-perfect-smart-snack": {
    src: "/photos/blog/why-makhana-is-the-perfect-smart-snack.webp", width: 1376, height: 768,
    alt: "A bowl of roasted makhana with fresh mint leaves",
  },
};

export const shapes: Record<ShapeName, string> = {
  "makhana-1": "/shapes/makhana-1.svg",
  "makhana-2": "/shapes/makhana-2.svg",
  "makhana-3": "/shapes/makhana-3.svg",
  "makhana-4": "/shapes/makhana-4.svg",
  "makhana-5": "/shapes/makhana-5.svg",
  chilli: "/shapes/chilli.svg",
  "pudina-leaf": "/shapes/pudina-leaf.svg",
  pepper: "/shapes/pepper.svg",
  salt: "/shapes/salt.svg",
  "black-salt": "/shapes/black-salt.svg",
  cheese: "/shapes/cheese.svg",
  "herb-sprig": "/shapes/herb-sprig.svg",
  berry: "/shapes/berry.svg",
  "chaat-star": "/shapes/chaat-star.svg",
  popcorn: "/shapes/popcorn.svg",
  butter: "/shapes/butter.svg",
  almond: "/shapes/almond.svg",
  cashew: "/shapes/cashew.svg",
  olive: "/shapes/olive.svg",
  "oil-drop": "/shapes/oil-drop.svg",
  tiffin: "/shapes/tiffin.svg",
};

export const videos = {
  bestsellersRotating: { src: "/video/bestsellers-rotating-video.mp4", width: 1280, height: 720 },
  banner: { src: "/video/banner-video.mp4", width: 1280, height: 720 },
} as const;
