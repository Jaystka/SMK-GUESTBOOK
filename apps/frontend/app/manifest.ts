import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Buku Tamu Sekolah",
    short_name: "Buku Tamu",
    description: "Registrasi tamu sekolah berbasis pengenalan wajah",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f7f6",
    theme_color: "#0d5c40",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }
    ]
  };
}
