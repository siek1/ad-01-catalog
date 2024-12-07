"use client";

import React, { useState } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import Product from "./components/Product";
import Header from "./components/Header";

// Test JSON data
const products = [
  { id: 1, name: "Product 1", price: "10 RON", discount: 0, imageUrl: "/Vin Jidvei.png" },
  { id: 2, name: "Product 2", price: "15 RON", discount: 10, imageUrl: "/Sos de Soia.png" },
  { id: 3, name: "Product 3", price: "20 RON", discount: 25, imageUrl: "/Paine Alba.png" },
  { id: 4, name: "Product 4", price: "25 RON", discount: 5, imageUrl: "/download.jpg" },
  { id: 5, name: "Product 5", price: "30 RON", discount: 0, imageUrl: "/mega-image.jpeg" },
  { id: 6, name: "Product 6", price: "35 RON", discount: 15, imageUrl: "/download.jpg" },
  { id: 7, name: "Product 7", price: "40 RON", discount: 0, imageUrl: "/mega-image.jpeg" },
  { id: 8, name: "Product 8", price: "45 RON", discount: 20, imageUrl: "/download.jpg" },
  { id: 9, name: "Product 9", price: "50 RON", discount: 0, imageUrl: "/mega-image.jpeg" },
  { id: 10, name: "Product 10", price: "55 RON", discount: 10, imageUrl: "/mega-image.jpeg" },
  { id: 11, name: "Product 11", price: "60 RON", discount: 0, imageUrl: "/mega-image.jpeg" },
  { id: 12, name: "Product 12", price: "65 RON", discount: 25, imageUrl: "/download.jpg" },
];

export default function Home() {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  // Calculate the products to display
  const startIndex = currentPage * itemsPerPage;
  const currentProducts = products.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handlers for navigation
  const handleNext = () => {
    if (startIndex + itemsPerPage < products.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-100 flex flex-col"
      style={{
        backgroundImage: "url('/test.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Header />
      <div className="flex flex-col items-center pt-5">
        {/* Grid Layout for Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-10">
          {currentProducts.map((product) => (
            <Product
              key={product.id}
              name={product.name}
              price={product.price}
              discount={product.discount}
              imageUrl={product.imageUrl}
            />
          ))}
        </div>
        {/* Carousel Controls */}
        <div className="flex items-center justify-center mt-8 gap-6">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className={`p-3 bg-gray-800 text-white rounded-full shadow-md transition-colors duration-300 ${
              currentPage === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-600"
            }`}
          >
            <AiOutlineArrowLeft className="text-2xl" />
          </button>
          <button
            onClick={handleNext}
            disabled={startIndex + itemsPerPage >= products.length}
            className={`p-3 bg-gray-800 text-white rounded-full shadow-md transition-colors duration-300 ${
              startIndex + itemsPerPage >= products.length
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-600"
            }`}
          >
            <AiOutlineArrowRight className="text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
}
