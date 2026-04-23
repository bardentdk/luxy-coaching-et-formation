import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

// Import optimisé de Google Fonts
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Luxy Formation | L'excellence de l'apprentissage",
  description: "Centre de formation d'excellence.",
  icons: "https://luxyformation.re/wp-content/uploads/2024/03/cropped-logo-luxy-dore-192x192.png"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} antialiased`}>
      <link rel="shortcut icon" href="https://luxyformation.re/wp-content/uploads/2024/03/cropped-logo-luxy-dore-192x192.png" type="image/x-icon" />
      <body className="font-sans text-navy bg-white">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}