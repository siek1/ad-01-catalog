"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type ProductType = {
  ProductName: string;
  Amount: number;
  Category: string;
  HealthyIndex: number;
  Price: number;
  Subcategory: string;
  BasicNeedsIndex: number;
  Discount: number;
  ImageURL: string;
};

export default function DataPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const personId = searchParams.get("id");

  useEffect(() => {
    const fetchData = async () => {
      if (!personId || isNaN(Number(personId)) || Number(personId) < 1 || Number(personId) > 50) {
        setError("Invalid personId");
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/purchase-details/?personId=${personId}`);
        const data = await response.json();

        if (!data.purchaseDetails || !Array.isArray(data.purchaseDetails)) {
          setError("Invalid data format from server");
          return;
        }

        setProducts(data.purchaseDetails);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data");
      }
    };

    fetchData();
  }, [personId]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {error ? (
        <div className="text-red-600 font-bold">{error}</div>
      ) : (
        <>
          <div className="flex items-center py-8">
            <img
              src="/logo.svg"
              alt="Mega Image Logo"
              className="h-16 w-16 object-contain"
            />
          </div>
          <div className="w-full max-w-6xl">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="text-left px-6 py-4">Image</th>
                  <th className="text-left px-6 py-4">Product Name</th>
                  <th className="text-right px-6 py-4">Amount</th>
                  <th className="text-right px-6 py-4">Price</th>
                  <th className="text-right px-6 py-4">Discount</th>
                  <th className="text-left px-6 py-4">Category</th>
                  <th className="text-left px-6 py-4">Subcategory</th>
                  <th className="text-right px-6 py-4">Healthy Index</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr
                    key={index}
                    className={`border-b text-black ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <img
                        src={product.ImageURL}
                        alt={product.ProductName}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4">{product.ProductName}</td>
                    <td className="px-6 py-4 text-right">{product.Amount}</td>
                    <td className="px-6 py-4 text-right">{`${product.Price} RON`}</td>
                    <td className="px-6 py-4 text-right">
                      {product.Discount > 0 ? `${product.Discount}%` : "-"}
                    </td>
                    <td className="px-6 py-4">{product.Category}</td>
                    <td className="px-6 py-4">{product.Subcategory}</td>
                    <td className="px-6 py-4 text-right">{product.HealthyIndex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="my-8">
            <Link href={`/products?id=${personId}`}>
              <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Generate Magazine
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
