// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
	outDir: "./site/dist",
	base: "/hooper/",
	vite: {
		plugins: [tailwindcss()],
	},
});
