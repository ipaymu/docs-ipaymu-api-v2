import type { MetadataRoute } from "next";
import { source, pluginsSource, verificationSource } from "@/lib/source";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://docs.ipaymu.com";

  const languages = ["id", "en"];

  // Base landing routes
  const staticRoutes: MetadataRoute.Sitemap = languages.map((lang) => ({
    url: `${baseUrl}/${lang}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
  }));

  // Public documentation routes
  const docsPages: MetadataRoute.Sitemap = source.getPages().map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Public plugins routes
  const pluginPages: MetadataRoute.Sitemap = pluginsSource.getPages().map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Public verification routes
  const verificationPages: MetadataRoute.Sitemap = verificationSource.getPages().map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // EXPLICIT SECURITY: Exclude any Close API routes from public sitemap indexing
  return [...staticRoutes, ...docsPages, ...pluginPages, ...verificationPages];
}
