import React from "react";
import Image from "next/image";

interface ProductProps {
  name: string;
  price: string;
  imageUrl: string;
}

const Product: React.FC<ProductProps> = ({ name, price, imageUrl }) => {
  return (
    <div className="w-1/4 bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden mx-4 flex flex-col items-center">
      {/* Top - Image */}
      <div className="w-full h-60 relative flex items-center justify-center bg-gray-50">
        <Image
          src={imageUrl}
          alt={name}
          layout="intrinsic"
          width={200} // Force a consistent image width
          height={200} // Force a consistent image height
          objectFit="contain" // Ensures the entire image fits within the container
          className="rounded-md"
        />
      </div>
      {/* Bottom - Text */}
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{name}</h3>
        <p className="text-gray-600">{price}</p>
      </div>
    </div>
  );
};

export default Product;
