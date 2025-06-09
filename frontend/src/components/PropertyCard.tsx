"use client"

import React from "react"
import { Link } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  MapPin,
  Building,
  Mail,
  MessageSquare,
  Eye,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Square,
} from "lucide-react"
import { formatDate } from "../utils/formatting"

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
    images?: string[]
    status?: string
  }
}

const PropertyImagePreview: React.FC<{ images: string[]; address: string }> = ({ images, address }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-t-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-3 mx-auto">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No images available</p>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="relative w-full h-48 rounded-t-2xl overflow-hidden group">
      <img
        src={`http://127.0.0.1:8000${images[currentImageIndex]}`}
        alt={`${address} - Image ${currentImageIndex + 1}`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={(e) => {
          e.currentTarget.src = "/placeholder.svg?height=192&width=400"
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              prevImage()
            }}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30"
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              nextImage()
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30"
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </button>

          <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-white text-sm font-medium">
              {currentImageIndex + 1} / {images.length}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 flex space-x-1">
            {images.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCurrentImageIndex(index)
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
            {images.length > 5 && <span className="text-white/70 text-xs ml-1">+{images.length - 5}</span>}
          </div>
        </>
      )}
    </div>
  )
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "reply_received":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
      case "email_sent":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case "reply_received":
        return "Reply Received"
      case "email_sent":
        return "Email Sent"
      case "pending":
        return "Pending"
      default:
        return "Unknown"
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "reply_received":
        return <CheckCircle className="h-3 w-3" />
      case "email_sent":
        return <Mail className="h-3 w-3" />
      default:
        return <AlertTriangle className="h-3 w-3" />
    }
  }

  return (
    <Link to={`/property/${property._id}`} className="block group">
      <div className="card overflow-hidden group-hover:scale-[1.02] transition-all duration-300">
        <PropertyImagePreview images={property.images || []} address={property.address} />

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-primary mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {property.address}
              </h3>
              <div className="flex items-center text-secondary mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">{property.submarket}</span>
              </div>
              <div className="flex items-center text-secondary mb-3">
                <Building className="h-4 w-4 mr-2" />
                <span className="text-sm">{property.true_owner}</span>
              </div>
            </div>

            {property.needs_attention && (
              <div className="ml-3">
                <div className="bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700 rounded-full px-3 py-1">
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="text-xs font-medium">Attention</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <p className="text-secondary text-xs font-medium">Asking Rent</p>
              </div>
              <p className="text-primary font-semibold">{property.asking_rent}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Square className="h-4 w-4 text-gray-500" />
                <p className="text-secondary text-xs font-medium">Available SF</p>
              </div>
              <p className="text-primary font-semibold">
                {property.sf_available ? property.sf_available.toLocaleString() : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-secondary text-sm">
                <Mail className="h-4 w-4 mr-1" />
                <span>{property.emails_sent} sent</span>
              </div>
              <div className="flex items-center text-secondary text-sm">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{property.replies_received} replies</span>
              </div>
            </div>

            {property.status && (
              <div className={`rounded-full px-3 py-1 border ${getStatusColor(property.status)}`}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(property.status)}
                  <span className="text-xs font-medium">{getStatusText(property.status)}</span>
                </div>
              </div>
            )}
          </div>

          {property.latest_reply_date && (
            <div className="text-tertiary text-sm mb-4">Last reply: {formatDate(property.latest_reply_date)}</div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-tertiary text-sm">
              {property.comparisons_available > 0 && (
                <span>
                  {property.comparisons_available} comparison{property.comparisons_available !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex items-center text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors group-hover:translate-x-1 duration-300">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default PropertyCard
