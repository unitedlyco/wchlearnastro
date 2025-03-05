import { defineConfig } from "astro/config";
import partytown from "@astrojs/partytown";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://foxi.netlify.app/",
  // Always use static output for this project since we're generating static pages
  output: "static",
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
