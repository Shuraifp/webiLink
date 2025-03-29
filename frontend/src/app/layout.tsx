"use client";

// import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import {
  Playfair_Display,
  Montserrat,
  Lora,
  Dancing_Script,
  Raleway,
  Merriweather,
  Roboto,
  Poppins,
  Lobster,
  Oswald,
} from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
});
const dancing = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dancing",
});
const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-raleway",
});
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-merriweather",
});
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});
const lobster = Lobster({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-lobster",
});
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-oswald",
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider store={store}>
    <html lang="en">
      <body
        className={`
              ${playfair.variable} ${montserrat.variable} ${lora.variable} ${dancing.variable} 
              ${raleway.variable} ${merriweather.variable} ${roboto.variable} ${poppins.variable} 
              ${lobster.variable} ${oswald.variable}
              `}
      >
          {/* <PersistGate loading={null} persistor={persistor}> */}
            {children}
          {/* </PersistGate> */}
      </body>
    </html>
        </Provider>
  );
}
