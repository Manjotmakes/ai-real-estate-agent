import { Link } from "react-router-dom"
import { Upload, Database, Building2, Mail, BarChart3, ArrowRight } from "lucide-react"

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">AI Real Estate Agent</h1>
            </div>
            <div className="text-sm text-gray-500">Powered by AI • Property Analysis & Communication</div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Intelligent Property Management</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Upload property PDFs or manage existing data. Our AI automatically extracts information, sends inquiries,
            processes replies, and provides intelligent comparisons to help you make informed decisions.
          </p>
        </div>

        {/* Main Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Upload New PDF Option */}
          <Link to="/upload" className="group">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 group-hover:border-blue-200">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-6 group-hover:bg-blue-200 transition-colors">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload New PDF</h3>
              <p className="text-gray-600 mb-6">
                Upload a property PDF document. Our AI will extract property data, add it to the database, and
                automatically send inquiry emails to property contacts.
              </p>
              <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                Start Upload Process
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Existing Data Option */}
          <Link to="/dashboard" className="group">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 group-hover:border-green-200">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-6 group-hover:bg-green-200 transition-colors">
                <Database className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">View Existing Data</h3>
              <p className="text-gray-600 mb-6">
                Access your property database, view sent emails, check replies, and analyze AI-generated comparisons to
                make informed contact decisions.
              </p>
              <div className="flex items-center text-green-600 font-semibold group-hover:text-green-700">
                Open Dashboard
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 mx-auto">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Email Generation</h4>
              <p className="text-gray-600">
                Automatically generates personalized inquiry emails for property contacts using advanced AI.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4 mx-auto">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Smart Analysis</h4>
              <p className="text-gray-600">
                Compares original property data with email replies to identify market changes and opportunities.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4 mx-auto">
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Property Management</h4>
              <p className="text-gray-600">
                Comprehensive dashboard to track properties, emails, replies, and make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
