import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yunch Bite",
    short_name: "Yunch Bite",
    description: "Slow-roasted makhana, popcorn and dry fruits. Yunchy. Crunchy. Healthy Bite.",
    start_url: "/",
    display: "browser",
    background_color: "#FFFDF5",
    theme_color: "#D61610",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
