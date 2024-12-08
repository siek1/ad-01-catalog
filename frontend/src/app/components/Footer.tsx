"use client";

import React, { useState, useEffect } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [personID, setPersonID] = useState<string | null>(null);

  useEffect(() => {
    // Extract the 'id' parameter from the URL using `window.location`
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      setPersonID(id);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!personID) {
      setMessage("Person ID is missing in the URL.");
      return;
    }

    const productLink = `http://localhost:3000/products?id=${personID}`; // Dynamically generate the product link

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, productLink }), // Pass email and product link
      });

      if (response.ok) {
        setMessage("Email sent successfully!");
      } else {
        setMessage("Failed to send email. Please try again.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <footer className="sticky bottom-0 bg-zinc-800 text-white p-4">
      <p>© 2024 Product Magazine. All Rights Reserved.</p>
      <form onSubmit={handleSubmit} className="mt-4 flex justify-center items-center gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="px-4 py-2 rounded-md text-gray-800 w-64"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Subscribe
        </button>
      </form>
      {message && <p className="mt-2 text-center">{message}</p>}
    </footer>
  );
};

export default Footer;
