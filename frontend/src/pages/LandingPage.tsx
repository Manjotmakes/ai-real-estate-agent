"use client";

import { Link } from "react-router-dom";
import {
  Upload,
  Database,
  Building2,
  Mail,
  BarChart3,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Star,
  CheckCircle,
  FileText,
  Sun,
  Moon,
} from "lucide-react";

interface LandingPageProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const LandingPage = ({ darkMode, toggleDarkMode }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-primary relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-bounce-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">RealEstate AI</h1>
                <p className="text-white/70 text-sm">
                  Intelligent Property Management
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`theme-toggle ${darkMode ? "active" : ""}`}
                title={
                  darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
              >
                <div className="theme-toggle-slider">
                  {darkMode ? (
                    <Moon className="h-3 w-3 text-gray-600" />
                  ) : (
                    <Sun className="h-3 w-3 text-yellow-500" />
                  )}
                </div>
              </button>

              <div className="hidden md:flex items-center space-x-2 text-white/80">
                <Star className="h-4 w-4 text-yellow-300" />
                <span className="text-sm">Trusted by 1000+ Agents</span>
              </div>
              <Link to="/dashboard" className="btn btn-primary">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 glass rounded-full px-6 py-3 mb-8">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <span className="text-white font-medium">
              AI-Powered Real Estate Intelligence
            </span>
          </div>

          <h1 className="text-7xl md:text-8xl font-bold text-white mb-8 leading-tight">
            Transform Your
            <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              Property Business
            </span>
          </h1>

          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed">
            Harness the power of AI to extract property data, automate
            communications, and make intelligent investment decisions. The
            future of real estate is here.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link to="/upload" className="btn btn-primary text-lg px-8 py-4">
              <Upload className="h-5 w-5" />
              Start Free Trial
            </Link>
            <Link
              to="/documentation"
              className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-medium">Read Documentation</span>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-white/70">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-300" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-300" />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-300" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          <Link to="/upload" className="group animate-slide-in-left">
            <div className="card p-8 h-full relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Smart PDF Processing
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Upload property documents and watch our AI extract every
                  detail - from property specs to contact information and even
                  images. No manual data entry required.
                </p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                  Upload Your First PDF
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          <Link to="/dashboard" className="group animate-slide-in-right">
            <div className="card p-8 h-full relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-secondary opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mb-6">
                  <Database className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Intelligent Dashboard
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Monitor your entire portfolio from one beautiful dashboard.
                  Track emails, analyze responses, and get AI-powered insights
                  to make better decisions.
                </p>
                <div className="flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
                  Explore Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="card p-12 animate-fade-in-up">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Everything you need to dominate the real estate market
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Mail,
                title: "AI Email Automation",
                description:
                  "Generate and send personalized emails to property contacts automatically",
                color: "bg-gradient-primary",
              },
              {
                icon: BarChart3,
                title: "Market Analysis",
                description:
                  "Compare property data with market responses to identify opportunities",
                color: "bg-gradient-success",
              },
              {
                icon: Building2,
                title: "Portfolio Management",
                description:
                  "Organize and track all your properties in one centralized platform",
                color: "bg-gradient-warning",
              },
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div
                  className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="card p-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to revolutionize your real estate business?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
              Join thousands of successful agents who are already using AI to
              close more deals.
            </p>
            <Link to="/upload" className="btn btn-primary text-lg px-8 py-4">
              <Sparkles className="h-5 w-5" />
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
