import React from "react";

interface EmailTemplateProps {
  linkToCatalogue: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  linkToCatalogue,
}) => (
  <div style={{ fontFamily: "Arial, sans-serif", color: "#333" }}>
    <h1>Buna Ziua</h1>
    <p>Aceasta este catalogul dumneavoastra personalizat, pentru saptamana aceasta.</p>
    <p>Veti primi cate un astfel de catalog in fiecare saptamana!</p>
    <p>
      Vizualizati catalogul:{" "}
      <a
        href={linkToCatalogue}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#007BFF" }}
      >
        {linkToCatalogue}
      </a>
    </p>
  </div>
);
