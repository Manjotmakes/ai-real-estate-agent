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
  RefreshCw,
  Eye,
  Send,
  Zap,
  Play,
  Loader2,
  Activity,
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

  // Mutations
  const sendEmailsMutation = useMutation({
    mutationFn: api.sendEmails,
    onSuccess: () => {
      toast.success("Emails sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["properties-with-status"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send emails");
    },
  });

  const processRepliesMutation = useMutation({
    mutationFn: api.processReplies,
    onSuccess: () => {
      toast.success("Email replies processed successfully!");
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["properties-with-status"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to process replies");
    },
  });

  const generateComparisonsMutation = useMutation({
    mutationFn: api.generateComparisons,
    onSuccess: () => {
      toast.success("Comparisons generated successfully!");
      queryClient.invalidateQueries({ queryKey: ["comparisons"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate comparisons");
    },
  });

  if (summaryLoading) {
    return <LoadingSpinner />;
  }

  if (summaryError) {
    return (
      <div className="p-8">
        <div className="card p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-4">
            Connection Error
          </h2>
          <p className="text-secondary mb-6">
            Unable to connect to the API. Please check your connection.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Properties",
      value: summary?.total_properties || 0,
      icon: Building2,
      color: "bg-gradient-primary",
      // change: "+12%",
    },
    {
      title: "Emails Sent",
      value: summary?.total_emails_sent || 0,
      icon: Mail,
      color: "bg-gradient-success",
      // change: "+8%",
    },
    {
      title: "Replies Received",
      value: summary?.total_replies || 0,
      icon: MessageSquare,
      color: "bg-gradient-secondary",
      // change: "+24%",
    },
    {
      title: "Need Attention",
      value: summary?.comparisons_needing_attention || 0,
      icon: AlertTriangle,
      color: "bg-gradient-warning",
      // change: "-5%",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-secondary">
            Welcome back! Here's what's happening with your properties.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="card p-6 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-green-600 text-sm font-medium">
                {/* {stat.change} */}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-primary mb-1">
              {stat.value.toLocaleString()}
            </h3>
            <p className="text-secondary text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-primary mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => sendEmailsMutation.mutate()}
            disabled={sendEmailsMutation.isPending}
            className="btn btn-primary w-full justify-center py-4"
          >
            {sendEmailsMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            {sendEmailsMutation.isPending ? "Sending..." : "Send Emails"}
          </button>

          <button
            onClick={() => processRepliesMutation.mutate()}
            disabled={processRepliesMutation.isPending}
            className="btn btn-success w-full justify-center py-4"
          >
            {processRepliesMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <MessageSquare className="h-5 w-5" />
            )}
            {processRepliesMutation.isPending
              ? "Processing..."
              : "Process Replies"}
          </button>

          <button
            onClick={() => generateComparisonsMutation.mutate()}
            disabled={generateComparisonsMutation.isPending}
            className="btn btn-secondary w-full justify-center py-4"
          >
            {generateComparisonsMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Zap className="h-5 w-5" />
            )}
            {generateComparisonsMutation.isPending
              ? "Generating..."
              : "Generate Comparisons"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-8">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "properties", label: "Properties", icon: Building2 },
              { id: "comparisons", label: "Comparisons", icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as "overview" | "properties" | "comparisons"
                  )
                }
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-secondary hover:text-primary hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8">
          {activeTab === "overview" && (
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-primary">
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
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              comparison.requires_attention
                                ? "bg-orange-400"
                                : "bg-green-400"
                            }`}
                          />
                          <div>
                            <p className="font-medium text-primary">
                              {comparison.property_address}
                            </p>
                            <p className="text-sm text-secondary">
                              {comparison.comparison_summary}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {comparison.requires_attention && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                              Needs Attention
                            </span>
                          )}
                          <span className="text-sm text-tertiary">
                            {new Date(
                              comparison.comparison_date
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-primary mb-2">
                    No Recent Activity
                  </h3>
                  <p className="text-secondary mb-6">
                    Start by uploading a PDF or processing existing data.
                  </p>
                  <Link to="/upload" className="btn btn-primary">
                    <Play className="h-4 w-4" />
                    Upload PDF
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "properties" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-primary">
                  All Properties
                </h3>
                <span className="text-secondary">
                  {properties?.properties?.length || 0} properties
                </span>
              </div>
              {propertiesLoading ? (
                <LoadingSpinner />
              ) : properties?.properties && properties.properties.length > 0 ? (
                <div className="grid gap-6">
                  {properties.properties.map((property: Property) => (
                    <PropertyCard key={property._id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-primary mb-2">
                    No Properties Found
                  </h3>
                  <p className="text-secondary mb-6">
                    Upload a PDF file to start tracking properties.
                  </p>
                  <Link to="/upload" className="btn btn-primary">
                    <Play className="h-4 w-4" />
                    Upload PDF
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "comparisons" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-primary">
                  Property Comparisons
                </h3>
                <span className="text-secondary">
                  {comparisons?.comparisons?.length || 0} comparisons
                </span>
              </div>
              {comparisonsLoading ? (
                <LoadingSpinner />
              ) : comparisons?.comparisons &&
                comparisons.comparisons.length > 0 ? (
                <div className="space-y-6">
                  {comparisons.comparisons.map(
                    (comparison: Comparison, index: number) => (
                      <div key={comparison._id || index} className="card p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-primary">
                              {comparison.property_address}
                            </h4>
                            <p className="text-secondary">
                              {comparison.comparison_summary}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {comparison.requires_attention ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Needs Attention
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Reviewed
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                            <h5 className="font-medium text-primary mb-2">
                              Rent Analysis
                            </h5>
                            <div className="space-y-1 text-sm text-secondary">
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
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                            <h5 className="font-medium text-primary mb-2">
                              Availability Analysis
                            </h5>
                            <div className="space-y-1 text-sm text-secondary">
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

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                comparison.market_signal === "positive"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : comparison.market_signal === "negative"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                              }`}
                            >
                              Market Signal: {comparison.market_signal || "N/A"}
                            </span>
                            <span className="text-sm text-tertiary">
                              {new Date(
                                comparison.comparison_date
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <Link
                            to={`/property/${comparison.property_id}`}
                            className="btn btn-primary"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Link>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-primary mb-2">
                    No Comparisons Available
                  </h3>
                  <p className="text-secondary mb-6">
                    Generate comparisons after processing replies.
                  </p>
                  <button
                    onClick={() => generateComparisonsMutation.mutate()}
                    className="btn btn-secondary"
                  >
                    <Zap className="h-4 w-4" />
                    Generate Comparisons
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
