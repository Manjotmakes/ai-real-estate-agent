"use client";

import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  Sparkles,
  Zap,
  Database,
  ArrowRight,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../services/api";

type UploadStatus = "idle" | "uploading" | "processing" | "complete";

const UploadPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");

  const uploadMutation = useMutation({
    mutationFn: api.uploadPDF,
    onSuccess: () => {
      setUploadStatus("processing");
      toast.success("PDF uploaded successfully! Processing data...");

      setTimeout(() => {
        setUploadStatus("complete");
        toast.success("Process completed! Data extracted successfully.");
      }, 2000);
    },
    onError: (error: any) => {
      toast.error(error.message || "Upload failed");
      setUploadStatus("idle");
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === "application/pdf") {
        setFile(file);
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === "application/pdf") {
        setFile(file);
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    setUploadStatus("uploading");
    uploadMutation.mutate(file);
  };

  return (
    <div className="p-8 pb-20 min-h-0">
      <div className="max-w-4xl mx-auto min-h-0">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Processing</span>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">
            Upload Property Document
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            Upload a PDF containing property information. Our AI will extract
            data, identify images, and organize everything automatically.
          </p>
        </div>

        {/* Upload Card */}
        <div className="card p-8 mb-8">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              dragActive
                ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105"
                : file
                ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"
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

            <div className="space-y-6">
              {file ? (
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-semibold text-primary">
                      {file.name}
                    </p>
                    <p className="text-secondary">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 text-sm font-medium">
                        Ready for processing
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto">
                    <Upload className="h-10 w-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-primary mb-2">
                      Drop your PDF here
                    </p>
                    <p className="text-secondary">or click to browse files</p>
                    <p className="text-tertiary text-sm mt-2">
                      Supports PDF files up to 50MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Upload Button */}
          {file && uploadStatus === "idle" && (
            <div className="mt-8 text-center">
              <button
                onClick={handleUpload}
                className="btn btn-primary text-lg px-8 py-4"
              >
                <Zap className="h-5 w-5" />
                Process with AI
              </button>
            </div>
          )}

          {/* Processing State */}
          {(uploadStatus === "uploading" || uploadStatus === "processing") && (
            <div className="mt-8 text-center">
              <button
                disabled
                className="btn bg-gray-400 text-white text-lg px-8 py-4 cursor-not-allowed"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                {uploadStatus === "uploading"
                  ? "Uploading..."
                  : "Processing with AI..."}
              </button>
            </div>
          )}

          {/* Success State */}
          {uploadStatus === "complete" && (
            <div className="mt-8 text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                <span className="text-lg font-semibold">
                  Processing Complete!
                </span>
              </div>
              <Link to="/dashboard" className="btn btn-success">
                <Database className="h-5 w-5" />
                View Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          )}

          {/* Progress Steps */}
          {uploadStatus !== "idle" && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                {[
                  {
                    label: "Upload",
                    active:
                      uploadStatus === "uploading" ||
                      uploadStatus === "processing" ||
                      uploadStatus === "complete",
                  },
                  {
                    label: "Process",
                    active:
                      uploadStatus === "processing" ||
                      uploadStatus === "complete",
                  },
                  { label: "Complete", active: uploadStatus === "complete" },
                ].map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className={`flex items-center space-x-2 ${
                        step.active ? "text-blue-600" : "text-gray-400"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.active
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      >
                        {step.active ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <span className="font-medium">{step.label}</span>
                    </div>
                    {index < 2 && (
                      <div
                        className={`w-16 h-1 mx-4 rounded ${
                          step.active
                            ? "bg-blue-600"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-primary mb-4">
              What happens next?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-0.5">
                  <Zap className="h-3 w-3 text-blue-600" />
                </div>
                <p className="text-secondary">
                  AI extracts property information and images
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-0.5">
                  <Database className="h-3 w-3 text-green-600" />
                </div>
                <p className="text-secondary">
                  Data is automatically saved to your database
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mt-0.5">
                  <CheckCircle className="h-3 w-3 text-purple-600" />
                </div>
                <p className="text-secondary">
                  Ready for email campaigns and analysis
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold text-primary mb-4">
              AI Capabilities
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mt-0.5">
                  <FileText className="h-3 w-3 text-orange-600" />
                </div>
                <p className="text-secondary">
                  Extracts property details and contact information
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mt-0.5">
                  <Sparkles className="h-3 w-3 text-pink-600" />
                </div>
                <p className="text-secondary">
                  Identifies and processes property images
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mt-0.5">
                  <Upload className="h-3 w-3 text-indigo-600" />
                </div>
                <p className="text-secondary">
                  Organizes data for immediate use
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPDF;
