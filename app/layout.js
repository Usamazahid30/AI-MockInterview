import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PrepPro – Master Your Interview Skills",
  description:
    "PrepPro is a web-based application designed to help users practice and master their interview skills in a structured and interactive way. Whether preparing for a job interview or improving communication skills, PrepPro provides a personalized experience, allowing users to record responses, practice common interview questions, and receive feedback to enhance their performance.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider enableFirstPartyCookie>
      <html lang="en">
        <link rel="icon" href="/favicon.png" />
        <body className={inter.className}>
          <Toaster />
          {children}
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
