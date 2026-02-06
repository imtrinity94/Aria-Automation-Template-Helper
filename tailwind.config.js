/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
        {
            pattern: /bg-(slate|indigo|orange|blue|emerald|red)-(50|100|500|600|950)/,
        },
        {
            pattern: /text-(slate|indigo|orange|blue|emerald|red)-(50|100|500|600|950)/,
        }
    ],
    theme: {
        extend: {
            colors: {
                // We can just use standard tailwind colors, but explicit definition can help if we want to alias them.
                // User requested: Backgrounds: slate-50 / slate-950. Primary: indigo-600 / indigo-500.
                // We will rely on built-in colors but can extend if needed.
            },
            fontFamily: {
                sans: ['ui-sans-serif', 'system-ui', 'sans-serif', "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
            }
        },
    },
    plugins: [],
}
