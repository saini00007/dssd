// Pack colours per flavour: sampled from the real pack photos (source "pack-photo"), or chosen
// to sit with the range where the client has no photo of that pack yet (source "provisional").
// `ink` is a readable text colour on `color` (WCAG contrast >= 4.5:1).
import type { FlavourKey } from "./keys";

export const packColors: Record<FlavourKey, { color: string; ink: string; source: "pack-photo" | "provisional" }> = {
  "peri-peri": { color: "#AA2A2A", ink: "#FFFDF5", source: "pack-photo" }, // ink contrast 6.7:1
  "chatpata": { color: "#E5601A", ink: "#2A1210", source: "provisional" }, // ink contrast 5.0:1
  "salt-pepper": { color: "#3D3B3D", ink: "#FFFDF5", source: "pack-photo" }, // ink contrast 10.9:1
  "pudina": { color: "#4E9B40", ink: "#2A1210", source: "pack-photo" }, // ink contrast 5.1:1
  "cheese-herbs": { color: "#DE9D3F", ink: "#2A1210", source: "pack-photo" }, // ink contrast 7.5:1
  "black-salt": { color: "#55306B", ink: "#FFFDF5", source: "provisional" }, // ink contrast 10.2:1
  "berry-berry": { color: "#C0267F", ink: "#FFFDF5", source: "provisional" }, // ink contrast 5.4:1
  "raw-makhana": { color: "#E6C28F", ink: "#2A1210", source: "provisional" }, // ink contrast 10.5:1
  "popcorn-salted": { color: "#E97598", ink: "#2A1210", source: "pack-photo" }, // ink contrast 6.3:1
  "popcorn-butter": { color: "#C4974C", ink: "#2A1210", source: "pack-photo" }, // ink contrast 6.6:1
  "popcorn-pudina": { color: "#D9E8A6", ink: "#2A1210", source: "pack-photo" }, // ink contrast 13.5:1
  "raw-almonds": { color: "#726638", ink: "#FFFDF5", source: "pack-photo" }, // ink contrast 5.6:1
  "raw-cashews": { color: "#281B4E", ink: "#FFFDF5", source: "pack-photo" }, // ink contrast 15.2:1
  "roasted-almonds": { color: "#876B41", ink: "#FFFDF5", source: "pack-photo" }, // ink contrast 4.9:1
  "roasted-cashews": { color: "#3F6941", ink: "#FFFDF5", source: "pack-photo" }, // ink contrast 6.2:1
};
