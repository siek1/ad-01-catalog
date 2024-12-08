import React from "react";
import Link from "next/link";

const Header = () => {
  return (
    <header className="relative bg-white">
      <div className="container mx-auto flex items-center justify-between py-4 px-8">
        {/* Left: Mega Image Logo and Text */}
        <div className="flex items-center">
          <Link href="/" passHref>
              <img
                src="/logo.svg"
                alt="Mega Image Logo"
                className="h-16 w-16 object-contain"
              />
          </Link>
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
