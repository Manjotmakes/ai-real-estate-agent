"use client";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import PropertyDetails from "./pages/PropertyDetails";
import UploadPDF from "./pages/UploadPDF";
import Documentation from "./pages/Documentation";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            }
          />
          <Route path="/documentation" element={<Documentation />} />
          <Route
            path="/*"
            element={
              <div className="flex flex-col min-h-screen bg-gradient-primary">
                <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden main-content">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/upload" element={<UploadPDF />} />
                    <Route path="/property/:id" element={<PropertyDetails />} />
                  </Routes>
                </main>
              </div>
            }
          />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: darkMode
                ? "rgba(30, 41, 59, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
              color: darkMode ? "#f8fafc" : "#0f172a",
              backdropFilter: "blur(10px)",
              border: `1px solid ${
                darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
              }`,
              borderRadius: "12px",
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
