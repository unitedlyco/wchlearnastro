import { defineConfig } from "astro/config";
import partytown from "@astrojs/partytown";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://foxi.netlify.app/",
  output: "server",
  // Only use Vercel adapter in production
  adapter: process.env.NODE_ENV === "production" ? vercel({
    analytics: true,
    // Increase build timeout for network requests
    buildOptions: {
      timeout: 60 * 1000 * 5, // 5 minutes
    },
    // Increase serverless function timeout
    functionOptions: {
      timeout: 30, // 30 seconds
    }
  }) : undefined,
  integrations: [
    react(),
    tailwind(),
    icon({
      include: {
        mdi: ["*"] // Include all icons from the MDI icon set
      }
    }),
    sitemap(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
  vite: {
    // ... existing vite config
    build: {
      // Increase build timeout
      timeout: 60000 * 5, // 5 minutes
    },
    // Add retry logic for network requests
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
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
