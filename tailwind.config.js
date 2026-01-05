/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				pastel: {
					peach: '#FFB4AB',
					coral: '#FFDAB9',
					mint: '#B2E0D4',
					mintLight: '#C7EFCF',
					lavender: '#E6D9F2',
					lavenderLight: '#D4C5F9',
					ivory: '#FAFAFA',
					lightGray: '#F5F5F5',
					charcoal: '#4A4A4A'
				}
			},
			fontFamily: {
				sans: [
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI',
					'Roboto',
					'Oxygen',
					'Ubuntu',
					'Cantarell',
					'Open Sans',
					'Helvetica Neue',
					'sans-serif'
				]
			}
		}
	},
	plugins: []
};
