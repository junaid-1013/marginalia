import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// only the public pages: everything else is behind login
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/login", "/create-account"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.4,
  }));
}
