import React from "react";

interface ProductProps {
  name: string;
  price: string;
  discount: number;
  imageUrl: string;
}

const Product: React.FC<ProductProps> = ({ name, price, discount, imageUrl }) => {
  const originalPrice = parseFloat(price.replace("RON", "").trim()); // Extract numeric value
  const discountedPrice = discount > 0 ? (originalPrice * (1 - discount / 100)).toFixed(2) : originalPrice;

  return (
    <div className="relative w-full bg-white border border-gray-200 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex flex-col p-4">
      {/* Discount Bubble */}
      {discount > 0 && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-lg font-bold flex items-center justify-center w-20 h-20 rounded-full shadow-[0_8px_15px_rgba(255,50,50,0.3)]">
          -{discount}%
        </div>
      )}

      {/* Product Image */}
      <div className="h-48 w-full flex items-center justify-center overflow-hidden bg-gray-100 rounded-md">
        <img
          src={imageUrl}
          alt={name}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-col items-center justify-between mt-4 flex-grow">
        {/* Product Name */}
        <h3 className="text-center text-lg font-semibold text-gray-800 min-h-[3rem]">
          {name}
        </h3>

        {/* Price Section */}
        <div className="mt-2 text-center">
          <p
            className={`text-xl ${
              discount > 0 ? "text-red-500 font-bold" : "text-gray-600"
            }`}
          >
            {discount > 0 ? `${discountedPrice} RON` : `${originalPrice} RON`}
          </p>
          {/* Reserve space for the original price */}
          <p
            className={`text-md ${
              discount > 0 ? "text-gray-500 line-through" : "invisible"
            }`}
          >
            {originalPrice} RON
          </p>
        </div>
      </div>
    </div>
  );
};

export default Product;
