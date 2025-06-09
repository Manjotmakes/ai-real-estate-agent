"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Building2,
  Mail,
  MessageSquare,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Eye,
  Send,
  Zap,
  Play,
  Loader2,
  Info,
} from "lucide-react";
import {
  api,
  type DashboardSummary,
  type PropertiesWithStatus,
  type ComparisonsResponse,
  type Comparison,
  type Property,
} from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import StatsCard from "../components/StatsCard";
import PropertyCard from "../components/PropertyCard";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "properties" | "comparisons"
  >("overview");
  const queryClient = useQueryClient();

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],
    queryFn: api.getDashboardSummary,
  });

  const {
    data: properties,
    isLoading: propertiesLoading,
    error: propertiesError,
  } = useQuery<PropertiesWithStatus>({
    queryKey: ["properties-with-status"],
    queryFn: api.getPropertiesWithStatus,
  });

  const {
    data: comparisons,
    isLoading: comparisonsLoading,
    error: comparisonsError,
  } = useQuery<ComparisonsResponse>({
    queryKey: ["comparisons"],
    queryFn: api.getComparisons,
  });

  // Mutation for sending emails
  const sendEmailsMutation = useMutation({
    mutationFn: api.sendEmails,
    onSuccess: (data) => {
      toast.success("Emails sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["properties-with-status"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send emails");
    },
  });

  // Mutation for processing replies
  const processRepliesMutation = useMutation({
    mutationFn: api.processReplies,
    onSuccess: (data) => {
      toast.success("Email replies processed successfully!");
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["properties-with-status"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to process replies");
    },
  });

  // Mutation for generating comparisons
  const generateComparisonsMutation = useMutation({
    mutationFn: api.generateComparisons,
    onSuccess: (data) => {
      toast.success("Comparisons generated successfully!");
      queryClient.invalidateQueries({ queryKey: ["comparisons"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate comparisons");
    },
  });

  const handleSendEmails = () => {
    if (
      confirm(
        "Send inquiry emails to all property contacts? This may take a few minutes."
      )
    ) {
      sendEmailsMutation.mutate();
    }
  };

  const handleProcessReplies = () => {
    if (
      confirm("Process new email replies? This will check for new responses.")
    ) {
      processRepliesMutation.mutate();
    }
  };

  const handleGenerateComparisons = () => {
    if (
      confirm(
        "Generate AI comparisons for properties with replies? This may take a few minutes."
      )
    ) {
      generateComparisonsMutation.mutate();
    }
  };

  if (summaryLoading) {
    return <LoadingSpinner />;
  }

  if (summaryError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">
            Failed to load dashboard data. Please check your API connection.
          </p>

          {/* Debug information */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              Debug Information:
            </h3>
            <div className="text-xs text-red-700 space-y-1">
              <p>
                <strong>API URL:</strong>{" "}
                http://127.0.0.1:8000/dashboard-summary/
              </p>
              <p>
                <strong>Error:</strong>{" "}
                {summaryError?.message || "Unknown error"}
              </p>
              <p>
                <strong>Possible causes:</strong>
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Backend server is not running</li>
                <li>Backend server is running on a different port</li>
                <li>CORS issues (check browser console)</li>
                <li>Network connection problems</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry Connection
            </button>
            <button
              onClick={() => {
                window.open(
                  "http://127.0.0.1:8000/dashboard-summary/",
                  "_blank"
                );
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Test API Directly
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Properties",
      value: summary?.total_properties || 0,
      icon: Building2,
      color: "blue" as const,
    },
    {
      title: "Emails Sent",
      value: summary?.total_emails_sent || 0,
      icon: Mail,
      color: "green" as const,
      subtitle: `To ${summary?.properties_with_emails || 0} properties`,
    },
    {
      title: "Replies Received",
      value: summary?.total_replies || 0,
      icon: MessageSquare,
      color: "purple" as const,
    },
    {
      title: "Need Attention",
      value: summary?.comparisons_needing_attention || 0,
      icon: AlertTriangle,
      color: "orange" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">
                Property Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Email Info Box */}
        {summary &&
          summary.total_emails_sent &&
          summary.total_emails_sent > 0 &&
          summary.properties_with_emails &&
          summary.total_emails_sent > summary.properties_with_emails && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-start">
              <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">
                  Email Distribution
                </h4>
                <p className="text-sm text-blue-700">
                  {summary.total_emails_sent} emails have been sent to{" "}
                  {summary.properties_with_emails} properties. Some properties
                  have multiple contact persons, resulting in multiple emails
                  per property.
                </p>
              </div>
            </div>
          )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Send Emails Button */}
            <button
              onClick={handleSendEmails}
              disabled={sendEmailsMutation.isPending}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sendEmailsMutation.isPending ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Send className="h-5 w-5 mr-2" />
              )}
              {sendEmailsMutation.isPending ? "Sending..." : "Send Emails"}
            </button>

            {/* Process Replies Button */}
            <button
              onClick={handleProcessReplies}
              disabled={processRepliesMutation.isPending}
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processRepliesMutation.isPending ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="h-5 w-5 mr-2" />
              )}
              {processRepliesMutation.isPending
                ? "Processing..."
                : "Process Replies"}
            </button>

            {/* Generate Comparisons Button */}
            <button
              onClick={handleGenerateComparisons}
              disabled={generateComparisonsMutation.isPending}
              className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generateComparisonsMutation.isPending ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Zap className="h-5 w-5 mr-2" />
              )}
              {generateComparisonsMutation.isPending
                ? "Generating..."
                : "Generate Comparisons"}
            </button>
          </div>

          {/* Action Descriptions */}
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <p>
              Send inquiry emails to all property contacts who haven't been
              contacted yet.
            </p>
            <p>
              Check Gmail for new replies and extract property information using
              AI.
            </p>
            <p>
              Generate AI-powered comparisons between original data and email
              replies.
            </p>
          </div>
        </div>

        {/* API Status Debug Info */}
        {/* {process.env.NODE_ENV === "development" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              Debug Info
            </h3>
            <p className="text-xs text-yellow-700">
              API Status: {summaryError ? "Error" : "Connected"} | Properties:{" "}
              {summary?.total_properties || 0} | Emails:{" "}
              {summary?.total_emails_sent || 0} | Last Updated:{" "}
              {summary?.last_updated
                ? new Date(summary.last_updated).toLocaleString()
                : "N/A"}
            </p>
          </div>
        )} */}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "properties", label: "Properties", icon: Building2 },
                {
                  id: "comparisons",
                  label: "Comparisons",
                  icon: MessageSquare,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as "overview" | "properties" | "comparisons"
                    )
                  }
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h3>
                {summary?.recent_comparisons &&
                summary.recent_comparisons.length > 0 ? (
                  <div className="space-y-4">
                    {summary.recent_comparisons
                      .slice(0, 5)
                      .map((comparison: Comparison, index: number) => (
                        <div
                          key={comparison._id || index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                comparison.requires_attention
                                  ? "bg-orange-400"
                                  : "bg-green-400"
                              }`}
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {comparison.property_address}
                              </p>
                              <p className="text-sm text-gray-600">
                                {comparison.comparison_summary}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {comparison.requires_attention && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Needs Attention
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              {new Date(
                                comparison.comparison_date
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No recent activity</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Recent comparisons will appear here once you start
                      processing property data.
                    </p>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={handleSendEmails}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send Emails
                      </button>
                      <button
                        onClick={handleProcessReplies}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Check Replies
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "properties" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    All Properties
                  </h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {properties?.properties?.length || 0} properties
                    </span>
                    {summary?.total_emails_sent &&
                      summary.total_emails_sent > 0 && (
                        <span className="text-sm text-green-600 font-medium">
                          {summary.total_emails_sent} emails sent
                        </span>
                      )}
                  </div>
                </div>
                {propertiesLoading ? (
                  <LoadingSpinner />
                ) : propertiesError ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-red-300 mx-auto mb-4" />
                    <p className="text-red-600 mb-2">
                      Error loading properties
                    </p>
                    <p className="text-sm text-gray-500">
                      Please check your API connection and try again.
                    </p>
                  </div>
                ) : properties?.properties &&
                  properties.properties.length > 0 ? (
                  <div className="grid gap-6">
                    {properties.properties.map((property: Property) => (
                      <PropertyCard key={property._id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No properties found</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Upload a PDF file to start tracking properties.
                    </p>
                    <Link
                      to="/upload"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Upload PDF
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "comparisons" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Property Comparisons
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">
                      {comparisons?.comparisons?.length || 0} comparisons
                    </span>
                    <button
                      onClick={handleGenerateComparisons}
                      disabled={generateComparisonsMutation.isPending}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 disabled:opacity-50"
                    >
                      {generateComparisonsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-1" />
                      )}
                      Generate New
                    </button>
                  </div>
                </div>
                {comparisonsLoading ? (
                  <LoadingSpinner />
                ) : comparisonsError ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-red-300 mx-auto mb-4" />
                    <p className="text-red-600 mb-2">
                      Error loading comparisons
                    </p>
                    <p className="text-sm text-gray-500">
                      Please check your API connection and try again.
                    </p>
                  </div>
                ) : comparisons?.comparisons &&
                  comparisons.comparisons.length > 0 ? (
                  <div className="space-y-4">
                    {comparisons.comparisons.map(
                      (comparison: Comparison, index: number) => (
                        <div
                          key={comparison._id || index}
                          className="bg-white border border-gray-200 rounded-lg p-6"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {comparison.property_address}
                              </h4>
                              <p className="text-gray-600">
                                {comparison.comparison_summary}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {comparison.requires_attention ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Needs Attention
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Reviewed
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">
                                Rent Analysis
                              </h5>
                              <div className="text-sm text-gray-600">
                                <p>
                                  Original:{" "}
                                  {comparison.rent_analysis?.original || "N/A"}
                                </p>
                                <p>
                                  Updated:{" "}
                                  {comparison.rent_analysis?.updated || "N/A"}
                                </p>
                                <p>
                                  Change:{" "}
                                  <span
                                    className={`font-medium ${
                                      comparison.rent_analysis?.change_type ===
                                      "increased"
                                        ? "text-red-600"
                                        : comparison.rent_analysis
                                            ?.change_type === "decreased"
                                        ? "text-green-600"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {comparison.rent_analysis?.change_type ||
                                      "N/A"}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">
                                Availability Analysis
                              </h5>
                              <div className="text-sm text-gray-600">
                                <p>
                                  Original SF:{" "}
                                  {comparison.availability_analysis?.original_sf?.toLocaleString() ||
                                    "N/A"}
                                </p>
                                <p>
                                  Updated SF:{" "}
                                  {comparison.availability_analysis?.updated_sf?.toLocaleString() ||
                                    "N/A"}
                                </p>
                                <p>
                                  Change:{" "}
                                  <span
                                    className={`font-medium ${
                                      comparison.availability_analysis
                                        ?.change_type === "increased"
                                        ? "text-green-600"
                                        : comparison.availability_analysis
                                            ?.change_type === "decreased"
                                        ? "text-red-600"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {comparison.availability_analysis
                                      ?.change_type || "N/A"}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  comparison.market_signal === "positive"
                                    ? "bg-green-100 text-green-800"
                                    : comparison.market_signal === "negative"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                Market Signal:{" "}
                                {comparison.market_signal || "N/A"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(
                                  comparison.comparison_date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <Link
                              to={`/property/${comparison.property_id}`}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Link>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">
                      No comparisons available
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      Property comparisons will appear here after processing
                      replies.
                    </p>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={handleProcessReplies}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Process Replies
                      </button>
                      <button
                        onClick={handleGenerateComparisons}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Generate Comparisons
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
