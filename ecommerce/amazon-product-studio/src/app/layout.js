import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import config from "@/lib/config";

const font = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "ListifyAI — Product listings that sell",
  description: "Create marketplace-ready titles, descriptions, bullets and SEO keywords for Amazon, Flipkart, Meesho and Shopify.",
};

export default function RootLayout({ children }) {
  const theme = config?.theme || "slate-indigo";

  return (
    <html lang="en" className="h-full w-full" data-theme={theme}>
      <body className={`${font.className} min-h-full w-full flex flex-col antialiased bg-bg-page text-primary-text`}>
        <Providers>
          <Navbar />
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
