import type React from "react"
import { Link } from "react-router-dom"
import {
  Building2,
  MapPin,
  DollarSign,
  Square,
  Mail,
  MessageSquare,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"

interface PropertyCardProps {
  property: {
    _id: string
    address: string
    submarket: string
    true_owner: string
    asking_rent: string
    sf_available: number
    emails_sent: number
    replies_received: number
    comparisons_available: number
    has_replies: boolean
    needs_attention: boolean
    latest_reply_date?: string
  }
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.address}</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {property.submarket}
            </div>
            <div className="flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
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

      {/* Status Indicators */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center text-sm">
          <Mail className="h-4 w-4 mr-1 text-blue-500" />
          <span className="text-gray-600">{property.emails_sent} sent</span>
        </div>
        <div className="flex items-center text-sm">
          <MessageSquare className="h-4 w-4 mr-1 text-green-500" />
          <span className="text-gray-600">{property.replies_received} replies</span>
        </div>
        {property.comparisons_available > 0 && (
          <div className="flex items-center text-sm">
            <CheckCircle className="h-4 w-4 mr-1 text-purple-500" />
            <span className="text-gray-600">{property.comparisons_available} comparisons</span>
          </div>
        )}
      </div>

      {/* Status Badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {property.has_replies ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Has Replies
            </span>
          ) : property.emails_sent > 0 ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Clock className="h-3 w-3 mr-1" />
              Waiting for Replies
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              No Emails Sent
            </span>
          )}

          {property.needs_attention && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Needs Attention
            </span>
          )}
        </div>

        <Link
          to={`/property/${property._id}`}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Link>
      </div>

      {property.latest_reply_date && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Latest reply: {new Date(property.latest_reply_date).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  )
}

export default PropertyCard
