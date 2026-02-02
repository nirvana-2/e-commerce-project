/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#059669", // Emerald-600
                secondary: "#64748B", // Slate-500
                accent: "#10B981", // Emerald-500
                dark: "#1E293B", // Slate-800
                light: "#F8FAFC", // Slate-50
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
