"use client"

import { Link, useLocation } from "react-router-dom"
import { Home, Upload, Building2, X, Sparkles } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  darkMode: boolean
}

const Sidebar = ({ isOpen, onClose, darkMode }: SidebarProps) => {
  const location = useLocation()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Upload PDF", href: "/upload", icon: Upload },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 sidebar transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-primary font-bold text-lg">RealEstate AI</h1>
                <p className="text-tertiary text-xs">Property Intelligence</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-tertiary hover:text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <div className="mb-6">
              <h3 className="text-tertiary text-xs font-semibold uppercase tracking-wider mb-3">Main Menu</h3>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-primary text-white shadow-lg"
                        : "text-secondary hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-700">
              <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">AI</span>
              </div>
              <div className="flex-1">
                <p className="text-primary font-medium text-sm">AI Assistant</p>
                <p className="text-tertiary text-xs">Always Online</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full status-online"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
