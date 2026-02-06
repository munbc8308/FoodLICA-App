import adapterStatic from '@sveltejs/adapter-static';
import adapterVercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isVercel = process.env.VERCEL === '1';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: isVercel
			? adapterVercel()
			: adapterStatic({
					pages: 'build',
					assets: 'build',
					fallback: 'index.html', // SPA mode for Capacitor
					precompress: false,
					strict: false
				}),
		paths: {
			relative: false
		}
	}
};

export default config;
