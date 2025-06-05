import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CopyEditProvider } from "./contexts/CopyEditContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CopyEditProvider>
      <App />
    </CopyEditProvider>
  </React.StrictMode>
);
