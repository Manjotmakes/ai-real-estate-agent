"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Upload, ArrowLeft, FileText, CheckCircle, Loader2 } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { api } from "../services/api"

const UploadPDF = () => {
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "sending" | "complete">("idle")

  const uploadMutation = useMutation({
    mutationFn: api.uploadPDF,
    onSuccess: () => {
      setUploadStatus("processing")
      toast.success("PDF uploaded successfully! Processing data...")

      // Simulate processing steps
      setTimeout(() => {
        setUploadStatus("sending")
        toast.success("Data extracted! Sending emails...")

        setTimeout(() => {
          setUploadStatus("complete")
          toast.success("Process completed! Emails have been sent.")
        }, 3000)
      }, 2000)
    },
    onError: (error: any) => {
      toast.error(error.message || "Upload failed")
      setUploadStatus("idle")
    },
  })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      if (file.type === "application/pdf") {
        setFile(file)
      } else {
        toast.error("Please upload a PDF file")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      const file = files[0]
      if (file.type === "application/pdf") {
        setFile(file)
      } else {
        toast.error("Please upload a PDF file")
      }
    }
  }

  const handleUpload = () => {
    if (!file) {
      toast.error("Please select a PDF file")
      return
    }

    setUploadStatus("uploading")
    uploadMutation.mutate(file)
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case "uploading":
      case "processing":
      case "sending":
        return <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      case "complete":
        return <CheckCircle className="h-6 w-6 text-green-600" />
      default:
        return <Upload className="h-6 w-6 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (uploadStatus) {
      case "uploading":
        return "Uploading PDF..."
      case "processing":
        return "Extracting property data..."
      case "sending":
        return "Sending inquiry emails..."
      case "complete":
        return "Process completed successfully!"
      default:
        return "Ready to upload"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900">Upload Property PDF</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Upload Area */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Property Document</h2>
              <p className="text-gray-600">
                Upload a PDF containing property information. Our AI will extract data and send inquiry emails
                automatically.
              </p>
            </div>

            {/* File Upload Zone */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-400 bg-blue-50"
                  : file
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadStatus !== "idle"}
              />

              <div className="space-y-4">
                {file ? (
                  <div className="flex items-center justify-center space-x-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">Drop your PDF here</p>
                      <p className="text-gray-500">or click to browse files</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Upload Button */}
            {file && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleUpload}
                  disabled={uploadStatus !== "idle"}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadStatus === "idle" ? (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Upload and Process
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Status Section */}
          {uploadStatus !== "idle" && (
            <div className="border-t border-gray-200 bg-gray-50 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon()}
                  <div>
                    <p className="font-medium text-gray-900">{getStatusText()}</p>
                    <p className="text-sm text-gray-600">
                      {uploadStatus === "complete"
                        ? "You can now view the results in your dashboard."
                        : "Please wait while we process your document."}
                    </p>
                  </div>
                </div>
                {uploadStatus === "complete" && (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                  >
                    View Dashboard
                  </Link>
                )}
              </div>

              {/* Progress Steps */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm">
                  <div
                    className={`flex items-center ${uploadStatus === "uploading" || uploadStatus === "processing" || uploadStatus === "sending" || uploadStatus === "complete" ? "text-green-600" : "text-gray-400"}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Upload PDF
                  </div>
                  <div
                    className={`flex items-center ${uploadStatus === "processing" || uploadStatus === "sending" || uploadStatus === "complete" ? "text-green-600" : "text-gray-400"}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Extract Data
                  </div>
                  <div
                    className={`flex items-center ${uploadStatus === "sending" || uploadStatus === "complete" ? "text-green-600" : "text-gray-400"}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Send Emails
                  </div>
                  <div
                    className={`flex items-center ${uploadStatus === "complete" ? "text-green-600" : "text-gray-400"}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">What happens after upload?</h3>
          <div className="space-y-2 text-blue-800">
            <p>• AI extracts property information from your PDF</p>
            <p>• Property data is automatically added to your database</p>
            <p>• Personalized inquiry emails are generated and sent to property contacts</p>
            <p>• You'll be notified when the process is complete</p>
            <p>• Check your dashboard for replies and AI-generated comparisons</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadPDF
