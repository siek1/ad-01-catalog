"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";

const RecipeComponent: React.FC = () => {
  const [recipeHTML, setRecipeHTML] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const personId = searchParams.get("id");

  useEffect(() => {
    const fetchData = async () => {
      // Validate personId
      if (!personId || isNaN(Number(personId))) {
        setError("Invalid or missing personId in query parameters.");
        return;
      }

      try {
        // Fetch the recipe
        const response = await fetch(`http://127.0.0.1:8000/generate-recipe/?personId=${personId}`);
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setRecipeHTML(data.recipe);
        setError(null); // Clear any previous errors
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      }
    };

    fetchData();
  }, [personId]);

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "red",
          textAlign: "center",
          backgroundColor: "white", // Set background to white
        }}
      >
        <p>{error}</p>
      </div>
    );
  }

  if (!recipeHTML) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "24px",
          fontWeight: "bold",
          backgroundColor: "white", // Set background to white
          color: "black", // Set text to black
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <>
    <Header />
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "white", // Set background to white
        color: "black", // Set text to black
      }}
    >
      {/* Render the HTML content safely */}
      <div dangerouslySetInnerHTML={{ __html: recipeHTML }} />
    </div>
    </>
    
  );
};

export default RecipeComponent;
