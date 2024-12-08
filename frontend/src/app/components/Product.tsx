import React from "react";

interface ProductProps {
  name: string;
  price: string; // Assume this is the original price as a string
  discount: number; // Discount percentage
  imageUrl: string;
}

const Product: React.FC<ProductProps> = ({ name, price, discount, imageUrl }) => {
  const originalPrice = parseFloat(price.replace("RON", "").trim()); // Extract numeric value from price
  const discountedPrice = discount > 0 ? (originalPrice * (1 - discount / 100)).toFixed(2) : originalPrice;

  return (
    <div className="relative w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col p-4">
      {/* Discount Bubble */}
      {discount > 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-sm font-bold py-3 px-5 rounded-full">
          -{discount}%
        </div>
      )}
      {/* Product Image */}
      <div className="flex-1 h-full w-full">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
      {/* Product Details */}
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
        <p
          className={`text-lg ${
            discount > 0 ? "text-red-500 font-bold" : "text-gray-600"
          }`}
        >
          {discount > 0 ? `${discountedPrice} RON` : `${originalPrice} RON`}
        </p>
        {discount > 0 && (
          <p className="text-sm text-gray-500 line-through">
            {originalPrice} RON
          </p>
        )}
      </div>
    </div>
  );
};

export default Product;
