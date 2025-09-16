"use client";
import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    title: "Sign Up",
    description: "Create your account in just a few clicks.",
    icon: "1️⃣",
  },
  {
    title: "Find a Tutor",
    description: "Use our search and AI-matching to find the perfect tutor.",
    icon: "2️⃣",
  },
  {
    title: "Book a Session",
    description: "Schedule a session at a time that works for you.",
    icon: "3️⃣",
  },
  {
    title: "Start Learning",
    description: "Connect with your tutor and start your session.",
    icon: "4️⃣",
  },
];

export default function HowItWorks() {
  return (
    <div className="bg-gray-50 py-12 dark:bg-gray-800">
      <div className="container mx-auto px-[100px]">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-800 dark:text-white">
          How It Works
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-700"
            >
              <div className="mb-4 text-4xl">{step.icon}</div>
              <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">
                {step.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-300">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}