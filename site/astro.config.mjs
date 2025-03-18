// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
	site: "https://icomey8.github.io",
	base: "/hooper",
	vite: {
		plugins: [tailwindcss()],
	},
});
