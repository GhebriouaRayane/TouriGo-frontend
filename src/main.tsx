
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { NotificationCenterProvider } from "./context/NotificationCenterContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <AuthProvider>
      <NotificationCenterProvider>
        <App />
      </NotificationCenterProvider>
    </AuthProvider>
  </LanguageProvider>
);
  
