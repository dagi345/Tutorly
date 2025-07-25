import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "../components/providers/convex-provider";
import NavBar from "../components/NavBar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Convex + Clerk Demo",
  description: "Realtime tasks with auth",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider> <NavBar />  {children} <Toaster /></ConvexClientProvider>
      </body>
    </html>
  );
}