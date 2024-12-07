import React from "react";

const Header = () => {
  return (
    <header className="relative bg-white ">
      <div className="container mx-auto flex items-center justify-between py-4 px-8">
        {/* Left: Mega Image Logo and Text */}
        <div className="flex items-center">
          <img
            src="/mega-image.jpeg"
            alt="Mega Image Logo"
            className="h-16 w-16 object-contain"
          />
          <h1 className="ml-4 text-3xl font-bold text-black">Mega Image</h1>
        </div>
        {/* Right: Product Catalog Text */}
        <div>
          <h1 className="text-3xl font-bold text-black">Product Catalog</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
