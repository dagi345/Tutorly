"use client";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function Hero() {
  const { isSignedIn } = useUser();

  const {user} = useUser()
  // Only query role when a Clerk user is available; otherwise skip
  const role = useQuery(api.users.getUserRole, user ? { clerkId: user.id } : "skip");


  
  return (
    <div className="relative bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/50 dark:to-gray-900">
      <div className="absolute inset-0 bg-[url('/dotted-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="relative container mx-auto px-[100px] py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-lg"
        >
          <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 md:text-5xl">
            Welcome to Tutorly
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
            Your on-demand platform for instant academic help. Connect with
            expert tutors, schedule sessions, and excel in your studies.
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {isSignedIn ? (
              <Link href= {`/${role}/dashboard`}>
                <Button size="lg" className="mt-8 bg-blue-600 hover:bg-blue-700">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/sign-in">
                <Button size="lg" className="mt-8 bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}