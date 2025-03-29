import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
        lora: ["var(--font-lora)", "serif"],
        dancing: ["var(--font-dancing)", "cursive"],
        raleway: ["var(--font-raleway)", "sans-serif"],
        merriweather: ["var(--font-merriweather)", "serif"],
        roboto: ["var(--font-roboto)", "sans-serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
        lobster: ["var(--font-lobster)", "cursive"],
        oswald: ["var(--font-oswald)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
