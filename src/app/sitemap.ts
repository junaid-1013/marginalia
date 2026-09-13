import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// only the public pages: everything else is behind login
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/login", "/create-account"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : path === "/about" ? 0.6 : 0.4,
  }));
}
