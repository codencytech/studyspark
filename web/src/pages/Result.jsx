import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Result() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("webInput"));
    if (!data) {
      alert("No input found. Please provide input first!");
      navigate("/");
      return;
    }

    // Simulate API processing
    setLoading(true);
    setTimeout(() => {
      const { input, action, language } = data;

      // For now, just mock the result
      let output = `Action: ${action}\n`;
      if (language) output += `Language: ${language}\n`;
      output += `Processed result of your input:\n${input}`;

      setResult(output);
      setLoading(false);
    }, 2000); // 2 seconds loader simulation
  }, []);

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      alert("Copied to clipboard!");
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Result</h2>

      {loading ? (
        <div style={loaderContainer}>
          <div style={dot}></div>
          <div style={{ ...dot, animationDelay: "0.2s" }}></div>
          <div style={{ ...dot, animationDelay: "0.4s" }}></div>
          <div style={{ ...dot, animationDelay: "0.6s" }}></div>
        </div>
      ) : (
        <>
          <pre style={resultStyle}>{result}</pre>
          <button onClick={copyResult} style={btnStyle}>Copy Result</button>
        </>
      )}
    </div>
  );
}

const containerStyle = {
  maxWidth: "700px",
  margin: "0 auto",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const loaderContainer = {
  display: "flex",
  gap: "8px",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "40px"
};

const dot = {
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  background: "linear-gradient(90deg,#7c3aed,#06b6d4)",
  animation: "pulse 0.8s infinite alternate"
};

const resultStyle = {
  background: "#0b1220",
  padding: "12px",
  borderRadius: "10px",
  color: "#fff",
  whiteSpace: "pre-wrap"
};

const btnStyle = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(90deg,#7c3aed,#06b6d4)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
  alignSelf: "flex-start"
};

// Add keyframes in JS for loader animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
@keyframes pulse {
  from { transform: scale(0.8); opacity: 0.6; }
  to { transform: scale(1.2); opacity: 1; }
}`, styleSheet.cssRules.length);
