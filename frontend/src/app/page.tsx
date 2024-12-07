"use client";

import React, { useState, useEffect } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import Product from "./components/Product";
import Header from "./components/Header";

// Define the Product type
type ProductType = {
  name: string;
  price: string;
  discount: number;
  imageUrl: string;
};

export default function Home() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/data/?personId=5&topN=24");
        const data = await response.json();

        // Map the API data to the required format
        const formattedProducts: ProductType[] = data.topRecommendations.map((item: any) => ({
          name: item.name,
          price: `${item.price} RON`,
          discount: item.discount,
          imageUrl: item.imageUrl,
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Calculate the products to display
  const startIndex = currentPage * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

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
              key={product.name} // Use 'name' as the unique key
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
