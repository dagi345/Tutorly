"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <main className="container mx-auto ">
      
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </main>
  );
}