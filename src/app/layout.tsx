import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { AppLayout } from "@/components/AppLayout";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { HealthProvider } from "@/context/HealthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const pjs = Plus_Jakarta_Sans({
  variable: "--font-pjs",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MediSage AI - Premium Medical Assistant",
  description: "A calm, modern, glassmorphism medical assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.variable} ${pjs.variable} font-sans antialiased h-full bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F1F5F9] transition-colors duration-300`}
      >
          <AuthProvider>
            <HealthProvider>
              <ThemeProvider>
                <AppLayout>
                  {children}
                </AppLayout>
              </ThemeProvider>
            </HealthProvider>
          </AuthProvider>

        <VisualEditsMessenger />
      </body>
    </html>
  );
}
