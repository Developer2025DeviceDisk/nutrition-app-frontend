/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                background: "#FFFFFF",
                primary: "#416834",
                secondary: "#DDE6F0",
                text: "#43483F",
                muted: "#888888",
                border: "#416834",
            },
        },
    },
    plugins: [],
};
