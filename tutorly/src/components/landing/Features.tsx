"use client";
import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Instant Tutor Appointments",
    description:
      "No more waiting. Find and book expert tutors in real-time. Get the help you need, exactly when you need it.",
    icon: "📅",
  },
  {
    title: "Live Video Calls",
    description:
      "Engage in face-to-face learning with our high-quality video call feature. It's like having a tutor right next to you.",
    icon: "📹",
  },
  {
    title: "AI-Powered Matching",
    description:
      "Our smart algorithm connects you with the perfect tutor based on your learning style, subject, and availability.",
    icon: "🤖",
  },
  {
    title: "Interactive Whiteboard",
    description:
      "Collaborate with your tutor on our interactive whiteboard. Solve problems, draw diagrams, and visualize concepts together.",
    icon: "✍️",
  },
  {
    title: "Session Recordings",
    description:
      "Never miss a detail. All your sessions are recorded, so you can revisit them anytime for revision.",
    icon: "🎥",
  },
];

export default function Features() {
  return (
    <div className="bg-white py-12 dark:bg-gray-900">
      <div className="container mx-auto px-[100px]">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-800 dark:text-white">
          Why Choose Tutorly?
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-lg bg-gray-50 p-6 shadow-lg dark:bg-gray-800"
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
