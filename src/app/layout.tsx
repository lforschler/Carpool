import type { Metadata } from "next";
import { Fraunces, Nunito_Sans } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ScheduleProvider } from "@/lib/schedule-store";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const body = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Carpool — Schedule",
  description:
    "Week, Agenda, and Month carpool schedule with Auth.js and Postgres persistence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <SessionProvider>
          <ScheduleProvider>{children}</ScheduleProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
