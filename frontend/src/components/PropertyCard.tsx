"use client";

import React from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { formatDate } from "../utils/formatting";

interface PropertyCardProps {
  property: {
    _id: string;
    address: string;
    submarket: string;
    true_owner: string;
    asking_rent: string;
    sf_available: number;
    emails_sent: number;
    replies_received: number;
    comparisons_available: number;
    has_replies: boolean;
    needs_attention: boolean;
    latest_reply_date?: string;
    images?: string[];
    status?: string;
  };
}

const PropertyImagePreview: React.FC<{ images: string[]; address: string }> = ({
  images,
  address,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No images available</p>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden group">
      <img
        src={`http://127.0.0.1:8000${images[currentImageIndex]}`}
        alt={`${address} - Image ${currentImageIndex + 1}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = "/placeholder.svg?height=192&width=400";
        }}
      />

      {images.length > 1 && (
        <>
          {/* Navigation buttons */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Image counter */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            {currentImageIndex + 1} / {images.length}
          </div>

          {/* Dots indicator */}
          <div className="absolute bottom-2 left-2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex
                    ? "bg-white"
                    : "bg-white bg-opacity-50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "reply_received":
        return "bg-green-100 text-green-800";
      case "email_sent":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "reply_received":
        return "Reply Received";
      case "email_sent":
        return "Email Sent";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  return (
    <Link to={`/property/${property._id}`} className="block">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Property Image */}
        <PropertyImagePreview
          images={property.images || []}
          address={property.address}
        />

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {property.address}
              </h3>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{property.submarket}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-3">
                <Building className="h-4 w-4 mr-1" />
                <span className="text-sm">{property.true_owner}</span>
              </div>
            </div>

            {property.needs_attention && (
              <div className="ml-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Attention
                </span>
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Asking Rent</p>
              <p className="font-semibold text-gray-900">
                {property.asking_rent}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Available SF</p>
              <p className="font-semibold text-gray-900">
                {property.sf_available
                  ? property.sf_available.toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Status and Activity */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-1" />
                <span>{property.emails_sent} sent</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{property.replies_received} replies</span>
              </div>
            </div>

            {property.status && (
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  property.status
                )}`}
              >
                {property.has_replies && (
                  <CheckCircle className="h-3 w-3 mr-1" />
                )}
                {getStatusText(property.status)}
              </span>
            )}
          </div>

          {/* Last Activity */}
          {property.latest_reply_date && (
            <div className="text-sm text-gray-500 mb-4">
              Last reply: {formatDate(property.latest_reply_date)}
            </div>
          )}

          {/* View Details Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {property.comparisons_available > 0 && (
                <span>
                  {property.comparisons_available} comparison
                  {property.comparisons_available !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex items-center text-blue-600 font-medium text-sm hover:text-blue-700">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
