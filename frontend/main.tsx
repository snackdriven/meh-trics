import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { FeatureOptionsProvider } from "./contexts/FeatureOptionsContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FeatureOptionsProvider>
      <App />
    </FeatureOptionsProvider>
  </React.StrictMode>
);
