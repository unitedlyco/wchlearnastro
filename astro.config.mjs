import { defineConfig } from "astro/config";
import partytown from "@astrojs/partytown";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://foxi.netlify.app/",
  output: process.env.NODE_ENV === "production" ? "server" : "static",
  adapter: process.env.NODE_ENV === "production" ? vercel() : undefined,
  integrations: [
    tailwind(),
    icon(),
    sitemap(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
  vite: {
    // ... existing vite config
  },
  head: [
    {
      tag: 'link',
      attrs: {
        rel: 'icon',
        type: 'image/png',
        href: '/@favicon.png'
      }
    }
  ]
});
