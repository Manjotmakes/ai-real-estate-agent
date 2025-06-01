"use client"
import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Square,
  Mail,
  MessageSquare,
  User,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { api } from "../services/api"
import LoadingSpinner from "../components/LoadingSpinner"

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ["property-details", id],
    queryFn: () => api.getPropertyDetails(id!),
    enabled: !!id,
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <div className="text-center py-12 text-red-600">Error loading property details</div>
  if (!data) return <div className="text-center py-12 text-gray-600">Property not found</div>

  const { property, replies, comparisons } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900">Property Details</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{property.address}</h2>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.submarket}
                </div>
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  {property.true_owner}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-green-600 mb-1">
                <DollarSign className="h-4 w-4 mr-1" />
                <span className="font-semibold">{property.asking_rent || "Withheld"}</span>
              </div>
              <div className="flex items-center text-blue-600">
                <Square className="h-4 w-4 mr-1" />
                <span className="font-semibold">{property.sf_available?.toLocaleString() || "N/A"} SF</span>
              </div>
            </div>
          </div>

          {/* Contact Persons */}
          {property.owner_contact_persons && property.owner_contact_persons.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Persons</h3>
              <div className="flex flex-wrap gap-2">
                {property.owner_contact_persons.map((person: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    <User className="h-3 w-3 mr-1" />
                    {person}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Email Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Email Activity
            </h3>

            {/* Sent Emails */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Sent Emails</h4>
              {property.sent_emails && property.sent_emails.length > 0 ? (
                <div className="space-y-3">
                  {property.sent_emails.map((email: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{email.contact_person}</span>
                        <span className="text-sm text-gray-500">{new Date(email.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{email.subject}</p>
                      <div className="text-xs text-gray-500">To: {email.contact_email}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No emails sent yet</p>
              )}
            </div>

            {/* Received Replies */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Received Replies</h4>
              {replies && replies.length > 0 ? (
                <div className="space-y-3">
                  {replies.map((reply: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{reply.contact_person}</span>
                        <span className="text-sm text-gray-500">{new Date(reply.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{reply.subject}</p>
                      <div className="text-xs text-gray-500 mb-2">From: {reply.from_email}</div>
                      {reply.parsed_data && Object.keys(reply.parsed_data).length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-xs font-medium text-gray-700 mb-1">Extracted Data:</p>
                          <div className="text-xs text-gray-600">
                            {Object.entries(reply.parsed_data).map(([key, value]: [string, any]) => (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">{key.replace("_", " ")}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No replies received yet</p>
              )}
            </div>
          </div>

          {/* Comparisons */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              AI Comparisons
            </h3>

            {comparisons && comparisons.length > 0 ? (
              <div className="space-y-4">
                {comparisons.map((comparison: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{comparison.comparison_summary}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(comparison.comparison_date).toLocaleDateString()}
                        </p>
                      </div>
                      {comparison.requires_attention ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Attention
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Reviewed
                        </span>
                      )}
                    </div>

                    {/* Rent Analysis */}
                    {comparison.rent_analysis && (
                      <div className="mb-3 p-3 bg-gray-50 rounded">
                        <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Rent Analysis
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Original: {comparison.rent_analysis.original}</p>
                            <p className="text-gray-600">Updated: {comparison.rent_analysis.updated}</p>
                          </div>
                          <div className="flex items-center">
                            {comparison.rent_analysis.change_type === "increased" && (
                              <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            {comparison.rent_analysis.change_type === "decreased" && (
                              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                            )}
                            <span
                              className={`font-medium ${
                                comparison.rent_analysis.change_type === "increased"
                                  ? "text-red-600"
                                  : comparison.rent_analysis.change_type === "decreased"
                                    ? "text-green-600"
                                    : "text-gray-600"
                              }`}
                            >
                              {comparison.rent_analysis.change_type}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Availability Analysis */}
                    {comparison.availability_analysis && (
                      <div className="mb-3 p-3 bg-gray-50 rounded">
                        <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Square className="h-4 w-4 mr-1" />
                          Availability Analysis
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">
                              Original SF: {comparison.availability_analysis.original_sf?.toLocaleString() || "N/A"}
                            </p>
                            <p className="text-gray-600">
                              Updated SF: {comparison.availability_analysis.updated_sf?.toLocaleString() || "N/A"}
                            </p>
                          </div>
                          <div className="flex items-center">
                            {comparison.availability_analysis.change_type === "increased" && (
                              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            )}
                            {comparison.availability_analysis.change_type === "decreased" && (
                              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span
                              className={`font-medium ${
                                comparison.availability_analysis.change_type === "increased"
                                  ? "text-green-600"
                                  : comparison.availability_analysis.change_type === "decreased"
                                    ? "text-red-600"
                                    : "text-gray-600"
                              }`}
                            >
                              {comparison.availability_analysis.change_type}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Market Signal */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          comparison.market_signal === "positive"
                            ? "bg-green-100 text-green-800"
                            : comparison.market_signal === "negative"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        Market Signal: {comparison.market_signal}
                      </span>
                    </div>

                    {comparison.notes && (
                      <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
                        <strong>Notes:</strong> {comparison.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No comparisons available yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetails
