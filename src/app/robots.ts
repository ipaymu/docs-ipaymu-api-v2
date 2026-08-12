import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://docs.ipaymu.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/close-api",
          "/close-api/*",
          "/*/close-api",
          "/*/close-api/*",
          "/close-api-export",
          "/*/close-api-export",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
