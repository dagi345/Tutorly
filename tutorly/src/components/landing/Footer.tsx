"use client";
import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-[100px] py-8">
        <div className="flex flex-col items-center justify-between sm:flex-row">
          <Link href="/">
            <span className="text-2xl font-bold text-gray-800 hover:text-gray-700 dark:text-white dark:hover:text-gray-300">
              Tutorly
            </span>
          </Link>
          <p className="mt-4 text-sm text-gray-500 sm:mt-0 dark:text-gray-300">
            © {new Date().getFullYear()} Tutorly. All Rights Reserved.
          </p>
          <div className="-mx-2 mt-4 flex sm:mt-0">
            <Link
              href="#"
              className="mx-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-500"
              aria-label="Facebook"
            >
              Facebook
            </Link>
            <Link
              href="#"
              className="mx-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-500"
              aria-label="Twitter"
            >
              Twitter
            </Link>
            <Link
              href="#"
              className="mx-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-500"
              aria-label="Instagram"
            >
              Instagram
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}