import React from "react";

interface ProductProps {
  name: string;
  price: string;
  discount: number;
  imageUrl: string;
}

const Product: React.FC<ProductProps> = ({ name, price, discount, imageUrl }) => {
  return (
    <div className="relative w-64 bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden flex flex-col">
      {/* Discount Bubble */}
      {discount > 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-sm font-bold py-4 px-5 rounded-full">
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
        <p className="text-gray-600">{price}</p>
      </div>
    </div>
  );
};

export default Product;
