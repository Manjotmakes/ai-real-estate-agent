"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, FileText, Code, Database, Mail, BarChart3, Zap, Server } from "lucide-react"

const Documentation: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </div>
            <div>
              <a
                href="#"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={(e) => {
                  e.preventDefault()
                  window.print()
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Download PDF
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-2xl">
          {/* Document Header */}
          <div className="px-8 py-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h1 className="text-4xl font-bold mb-4">AI-Powered Real Estate Communication System</h1>
            <p className="text-xl opacity-90">Project Documentation</p>
          </div>

          {/* Document Content */}
          <div className="px-8 py-10 space-y-12 text-gray-800 dark:text-gray-200">
            {/* Project Overview */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Project Overview</h2>
              <p className="mb-4 leading-relaxed">
                The AI-Powered Real Estate Communication System is a full-stack application designed to automate
                property data extraction, communication with property contacts, and response analysis in the real estate
                domain. By leveraging AI agents powered by Azure OpenAI (GPT-4o-mini) and Autogen, the system
                streamlines workflows for brokers, buyers, and property analysts. The application integrates a
                Python-based backend with FastAPI, a MongoDB database, and a React frontend dashboard styled with
                TailwindCSS.
              </p>
            </section>

            {/* Workflow */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Workflow</h2>
              <p className="mb-6 leading-relaxed">
                The system operates through a sequence of AI-driven tasks handled by specialized agents. The workflow is
                illustrated below:
              </p>

              {/* Workflow Diagram */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">PDF Upload & Parsing</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Users upload a real estate PDF
                      <br />
                      Property details are extracted
                      <br />
                      <span className="text-blue-600 dark:text-blue-400">Agent: pdf_parser_agent</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                      <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Email Generation & Sending</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Emails are sent to contacts
                      <br />
                      <span className="text-green-600 dark:text-green-400">Agent: email_sender_agent</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                      <Mail className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Reading Email Replies</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Updates are extracted
                      <br />
                      <span className="text-purple-600 dark:text-purple-400">Agent: reply_extractor_agent</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
                      <BarChart3 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Comparing Data</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Differences are identified
                      <br />
                      <span className="text-orange-600 dark:text-orange-400">Agent: comparison_agent</span>
                    </p>
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <Database className="h-8 w-8 text-gray-600 dark:text-gray-300" />
                  </div>
                </div>
                <p className="text-center mt-2 text-gray-600 dark:text-gray-400">Database</p>
              </div>

              {/* PDF Upload & Parsing */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  PDF Upload & Parsing (Agent: pdf_parser_agent)
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Users upload real estate marketing PDFs containing multiple property listings.</li>
                  <li>
                    The AI agent processes the document using PyMuPDF to extract structured data, including:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Address, submarket, and asking rent</li>
                      <li>Available square footage</li>
                      <li>Company name (true_owner)</li>
                      <li>Actual contact persons (with phone numbers)</li>
                      <li>Property images</li>
                    </ul>
                  </li>
                  <li>Extracted data is stored in a MongoDB database for subsequent operations.</li>
                </ul>
              </div>

              {/* Email Generation & Sending */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Automated Email Generation & Sending (Agent: email_sender_agent)
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    Users can initiate customized inquiry emails to property contacts directly from the dashboard.
                  </li>
                  <li>The agent generates email content tailored to each property and sends it via the Gmail API.</li>
                  <li>
                    Metadata (e.g., subject, contact name, message IDs) is stored alongside the property data in
                    MongoDB.
                  </li>
                </ul>
              </div>

              {/* Reading Email Replies */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                  Reading Email Replies & Extracting Updates (Agent: reply_extractor_agent)
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>The agent monitors email replies by tracking message threads.</li>
                  <li>
                    It extracts updated property details from responses, such as:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>New asking rent</li>
                      <li>Updated square footage</li>
                      <li>Availability status</li>
                    </ul>
                  </li>
                  <li>
                    Extracted data is saved in a dedicated MongoDB collection (email_replies_collection) for further
                    analysis.
                  </li>
                </ul>
              </div>

              {/* Comparing Data */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                  Comparing Original vs. Updated Data (Agent: comparison_agent)
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>The agent compares original PDF data with updates from email replies.</li>
                  <li>
                    It identifies and notifies users of key differences, such as price changes, reduced space, or leased
                    status.
                  </li>
                  <li>This provides transparency and supports informed decision-making.</li>
                </ul>
              </div>
            </section>

            {/* Tech Stack */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tech Stack</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Code className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <span className="text-gray-800 dark:text-gray-200">Python</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Server className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                  <span className="text-gray-800 dark:text-gray-200">FastAPI</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                  <span className="text-gray-800 dark:text-gray-200">Autogen</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Mail className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                  <span className="text-gray-800 dark:text-gray-200">Gmail API</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-3" />
                  <span className="text-gray-800 dark:text-gray-200">PyMuPDF</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Code className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <span className="text-gray-800 dark:text-gray-200">React</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Code className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mr-3" />
                  <span className="text-gray-800 dark:text-gray-200">TailwindCSS</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Database className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                  <span className="text-gray-800 dark:text-gray-200">MongoDB</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <span className="text-gray-800 dark:text-gray-200">Azure OpenAI</span>
                </div>
              </div>
            </section>

            {/* Summary */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Summary</h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-6">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  This system demonstrates end-to-end AI integration for real estate data management, from document
                  parsing to automated email communication and response analysis. It serves as a powerful tool for real
                  estate professionals, enhancing efficiency and decision-making.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Documentation
