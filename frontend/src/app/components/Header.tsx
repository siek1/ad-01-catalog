import React from "react";
import Link from "next/link";

const Header = () => {
  return (
    <header className="relative bg-white">
      <div className="container mx-auto flex items-center justify-between py-2 px-6">
        {/* Left: Mega Image Logo and Text */}
        <div className="flex items-center">
          <Link href="/" passHref>
            <img
              src="/logo.svg"
              alt="Mega Image Logo"
              className="h-10 w-10 object-contain" // Smaller dimensions for the logo
            />
          </Link>
          <h1 className="ml-3 text-xl font-semibold text-black">Mega Image</h1>
        </div>
        {/* Right: Product Catalog Text */}
        <div>
          <h1 className="text-xl font-semibold text-black">Product Catalog</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
