"use client";

import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, type Property } from "../services/api";
import { formatDate } from "../utils/formatting";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Home,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  ImageIcon,
} from "lucide-react";

const PropertyImageGallery: React.FC<{ images: string[]; address: string }> = ({
  images,
  address,
}) => {
  const [selectedImage, setSelectedImage] = React.useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ImageIcon className="h-5 w-5 mr-2" />
          Property Images
        </h3>
        <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
          <div className="text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">
              No images available for this property
            </p>
          </div>
        </div>
      </div>
    );
  }

  const openModal = (index: number) => {
    setSelectedImage(index);
    setCurrentImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ImageIcon className="h-5 w-5 mr-2" />
          Property Images ({images.length})
        </h3>

        {/* Main image */}
        <div className="mb-4">
          <div
            className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => openModal(0)}
          >
            <img
              src={`http://127.0.0.1:8000${images[0]}`}
              alt={`${address} - Main image`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=384&width=600";
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
              <div className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium opacity-0 hover:opacity-100 transition-opacity">
                Click to view full size
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                onClick={() => openModal(index)}
              >
                <img
                  src={`http://127.0.0.1:8000${image}`}
                  alt={`${address} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "/placeholder.svg?height=100&width=100";
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for full-size images */}
      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-all z-10"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-all z-10"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-all z-10"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Main image */}
            <img
              src={`http://127.0.0.1:8000${images[currentImageIndex]}`}
              alt={`${address} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=600&width=800";
              }}
            />

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} of {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    isLoading,
    error,
    data: property,
  } = useQuery<Property>({
    queryKey: ["property", id],
    queryFn: () => api.getProperty(id!),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error loading property</p>
          <p className="text-gray-500">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Property not found</p>
        </div>
      </div>
    );
  }

  const lastEmailDate =
    property.email_activity && property.email_activity.length > 0
      ? formatDate(property.email_activity[0].date)
      : "N/A";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-blue-500 hover:text-blue-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Details */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {property.address}
              </h1>

              <div className="flex items-center text-gray-700 mb-4">
                <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                <span>{property.submarket}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Asking Rent
                  </h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {property.asking_rent}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Available Space
                  </h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {property.sf_available
                      ? `${property.sf_available.toLocaleString()} SF`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    True Owner
                  </h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {property.true_owner}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Contact Email
                  </h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {property.contact_email || "N/A"}
                  </p>
                </div>
              </div>

              {/* Status indicators */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    property.emails_sent > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {property.emails_sent > 0 ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {property.emails_sent} Email
                      {property.emails_sent !== 1 ? "s" : ""} Sent
                    </>
                  ) : (
                    "No Emails Sent"
                  )}
                </span>

                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    property.replies_received > 0
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {property.replies_received > 0 ? (
                    <>
                      <Mail className="h-3 w-3 mr-1" />
                      {property.replies_received} Repl
                      {property.replies_received !== 1 ? "ies" : "y"}
                    </>
                  ) : (
                    "No Replies"
                  )}
                </span>

                {property.needs_attention && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    Needs Attention
                  </span>
                )}
              </div>
            </div>

            {/* Property Images */}
            <PropertyImageGallery
              images={property.images || []}
              address={property.address}
            />
          </div>

          {/* Additional Information */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Activity
              </h3>
              {property.email_activity && property.email_activity.length > 0 ? (
                <>
                  <p className="text-gray-700 mb-4">
                    Last email sent: {lastEmailDate}
                  </p>
                  <div className="space-y-2">
                    {property.email_activity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {activity.type}
                          </p>
                          {activity.description && (
                            <p className="text-sm text-gray-600">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(activity.date)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-700">
                  No email activity recorded for this property.
                </p>
              )}
            </div>

            {property.showing_availability &&
              property.showing_availability.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Showing Availability
                  </h3>
                  <div className="space-y-2">
                    {property.showing_availability.map(
                      (availability, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="font-medium text-gray-900">
                            {availability.day}
                          </span>
                          <span className="text-gray-600">
                            {availability.time}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {property.utilities_included &&
              property.utilities_included.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Utilities Included
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {property.utilities_included.map((utility, index) => (
                      <div
                        key={index}
                        className="flex items-center p-2 bg-green-50 rounded-lg"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-gray-900">{utility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Status indicator */}
            <div
              className={`rounded-lg p-4 ${
                property.is_active !== false
                  ? "bg-green-100 text-green-700 border border-green-500"
                  : "bg-red-100 text-red-700 border border-red-500"
              }`}
            >
              <div className="flex items-center">
                {property.is_active !== false ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>
                      This property is currently active and available.
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 mr-2" />
                    <span>This property is not active.</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
