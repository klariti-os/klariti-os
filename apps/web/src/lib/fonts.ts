import {
  Space_Mono,
  Poppins,
  Literata
} from "next/font/google"


export const fontMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
})

export const fontSans = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
})

export const fontSerif = Literata({ 
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
})
