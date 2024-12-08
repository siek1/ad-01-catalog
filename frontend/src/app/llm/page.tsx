"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
        const response = await fetch(
          `http://127.0.0.1:8000/generate-recipe/?personId=${personId}`
        );
        if (!response.ok) {
          throw new Error(
            `Server error: ${response.status} ${response.statusText}`
          );
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

  useEffect(() => {
    // Disable scrolling
    document.body.style.overflow = "hidden";
    return () => {
      // Re-enable scrolling on cleanup
      document.body.style.overflow = "auto";
    };
  }, []);

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
          backgroundColor: "white",
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
          backgroundColor: "white",
          color: "black",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        backgroundColor: "white",
        color: "black",
        overflow: "hidden",
      }}
    >
      <Header />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "60px",
          flexGrow: 1,
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: recipeHTML }} />
      </div>
      <Footer />
    </div>
  );
};

export default RecipeComponent;
