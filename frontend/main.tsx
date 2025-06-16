import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/tokens.css";
import "./styles/theme-transitions.css";
import { UnifiedThemeProvider } from "./theme";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UnifiedThemeProvider>
      <App />
    </UnifiedThemeProvider>
  </React.StrictMode>
);
