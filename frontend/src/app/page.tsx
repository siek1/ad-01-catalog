"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [query, setQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const isValidQuery = () => {
    const id = parseInt(query, 10);
    return !isNaN(id) && id >= 1 && id <= 50;
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
      style={{
        // backgroundImage: url('/background.jpg'), // Replace with your background image URL
      }}
    >
      {/* Logo on Top Left */}
      <div className="absolute top-4 left-4">
        <Image src="/logo.svg" alt="Logo" width={100} height={100} />
      </div>

      {/* Centered Text */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-6">Welcome to Our Platform</h1>

        {/* Input Field */}
        <div className="flex items-center justify-center space-x-2">
          <input
            type="text"
            placeholder="Search here (1-50)..."
            value={query}
            onChange={handleInputChange}
            className="px-4 py-2 rounded-lg border border-gray-300 shadow-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {isValidQuery() ? (
            <Link
              href={`http://localhost:3000/data?id=${query}`}
              className="bg-blue-500 text-black px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Go
            </Link>
          ) : (
            <button
              disabled
              className="bg-gray-400 text-black px-6 py-2 rounded-lg cursor-not-allowed"
            >
              Invalid
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
