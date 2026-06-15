// 'use client'
// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Roboto } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar5 from "@/components/Navbar";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import Providers from "@/components/Provider";
import { Metadata } from "next";


const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // IMPORTANT
  variable: "--font-roboto",
});
export const metadata: Metadata = {
  title: "Dev-Nautics",
  description: "heaven for developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${roboto.className}  h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
      <Providers>
        
          {children}
      </Providers>
      </body>
    </html>
  );
}
