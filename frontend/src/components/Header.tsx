"use client";

import { Link, useLocation } from "react-router-dom";
import { Home, Upload, User, Sun, Moon, Building2 } from "lucide-react";

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header = ({ darkMode, toggleDarkMode }: HeaderProps) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Upload PDF", href: "/upload", icon: Upload },
  ];

  return (
    <header className="glass border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <a href="/">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  RealEstate AI
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Property Intelligence
                </p>
              </div>
            </div>
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-primary text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-primary text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  title={item.name}
                >
                  <item.icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`theme-toggle ${darkMode ? "active" : ""}`}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <div className="theme-toggle-slider">
              {darkMode ? (
                <Moon className="h-3 w-3 text-gray-600" />
              ) : (
                <Sun className="h-3 w-3 text-yellow-500" />
              )}
            </div>
          </button>

          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-gray-900 dark:text-white font-medium text-sm">
                Admin User
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                admin@realestate.ai
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
