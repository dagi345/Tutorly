"use client";
import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Sarah L.",
    role: "Student",
    quote:
      "Tutorly has been a game-changer for my studies. I found a fantastic tutor within minutes and my grades have improved significantly!",
  },
  {
    name: "David M.",
    role: "Tutor",
    quote:
      "As a tutor, Tutorly provides a seamless platform to connect with students. The video call and whiteboard features are top-notch.",
  },
  {
    name: "Emily R.",
    role: "Student",
    quote:
      "I love the flexibility of Tutorly. I can get help anytime I need it, and the session recordings are perfect for revision.",
  },
];

export default function Testimonials() {
  return (
    <div className="bg-white py-12 dark:bg-gray-900">
      <div className="container mx-auto px-[100px]">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-800 dark:text-white">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-lg bg-gray-50 p-6 shadow-lg dark:bg-gray-800"
            >
              <p className="text-gray-500 dark:text-gray-300">
                "{testimonial.quote}"
              </p>
              <div className="mt-4">
                <p className="font-bold text-gray-800 dark:text-white">
                  {testimonial.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {testimonial.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}