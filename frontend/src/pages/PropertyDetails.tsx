"use client";

import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, type Property } from "../services/api";
import { formatDate } from "../utils/formatting";
import {
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
  Building2,
  DollarSign,
  Square,
  MessageSquare,
  Clock,
  User,
  Share2,
  Download,
  Bookmark,
  AlertTriangle,
  BarChart3,
  Phone,
} from "lucide-react";
interface EmailData {
  id?: string;
  from: string;
  to: string;
  subject: string;
  body?: string;
  snippet?: string;
  date: string;
}
const PropertyImageGallery: React.FC<{
  images: string[];
  address: string;
  propertyId: string;
}> = ({ images, address, propertyId }) => {
  const [selectedImage, setSelectedImage] = React.useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <ImageIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
          Property Images
        </h3>
        <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-900 rounded-lg">
          <div className="text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <ImageIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
          Property Images ({images.length})
        </h3>

        <div className="mb-4">
          <div
            className="relative w-full h-96 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden cursor-pointer"
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
              <div className="bg-white dark:bg-gray-800 bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium opacity-0 hover:opacity-100 transition-opacity">
                Click to view full size
              </div>
            </div>
          </div>
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all ${
                  index === currentImageIndex ? "ring-2 ring-blue-500" : ""
                }`}
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

      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-all z-10"
            >
              <X className="h-6 w-6" />
            </button>

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

            <img
              src={`http://127.0.0.1:8000${images[currentImageIndex]}`}
              alt={`${address} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=600&width=800";
              }}
            />

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
  const [showConversation, setShowConversation] = React.useState(false);
  const [conversation, setConversation] = React.useState<EmailData[]>([]);
  const [loadingConversation, setLoadingConversation] = React.useState(false);

  const {
    isLoading,
    error,
    data: property,
  } = useQuery<Property>({
    queryKey: ["property", id],
    queryFn: () => api.getProperty(id!),
  });

  const fetchConversation = async () => {
    setLoadingConversation(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/property/${id}/conversation/`
      );
      const data = await response.json();

      if (response.ok) {
        setConversation(data.conversation || []);
        setShowConversation(true);
      } else {
        console.error("Failed to fetch conversation:", data.error);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    } finally {
      setLoadingConversation(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading property details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-2">
            Error loading property
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Property not found</p>
        </div>
      </div>
    );
  }

  const lastEmailDate =
    property.email_activity && property.email_activity.length > 0
      ? formatDate(property.email_activity[0].date)
      : "N/A";

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <Link
                to="/dashboard"
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                Dashboard
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span>Property Details</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {property.address}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={fetchConversation}
              disabled={loadingConversation}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Mail className="h-4 w-4" />
              <span>{loadingConversation ? "Loading..." : "Contact"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PropertyImageGallery
              images={property.images || []}
              address={property.address}
              propertyId={id!}
            />
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Property Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Location
                    </h3>
                    <div className="flex items-center text-gray-900 dark:text-white">
                      <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                      <div>
                        <p className="font-medium">{property.address}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {property.submarket}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Ownership
                    </h3>
                    <div className="flex items-center text-gray-900 dark:text-white">
                      <Building2 className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                      <div>
                        <p className="font-medium">{property.true_owner}</p>
                        {property.agent_name && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Agent: {property.agent_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Contact
                    </h3>
                    <div className="flex items-center text-gray-900 dark:text-white">
                      <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                      <div>
                        <p className="font-medium">
                          {property.contact_email || "raviking2311@gmail.com"}
                        </p>
                        {property.agent_phone && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {property.agent_phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Asking Rent
                    </h3>
                    <div className="flex items-center text-gray-900 dark:text-white">
                      <DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                      <p className="font-medium text-lg">
                        {property.asking_rent}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Available Space
                    </h3>
                    <div className="flex items-center text-gray-900 dark:text-white">
                      <Square className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                      <p className="font-medium text-lg">
                        {property.sf_available
                          ? `${property.sf_available.toLocaleString()} SF`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Status
                    </h3>
                    <div className="flex items-center">
                      {property.is_active !== false ? (
                        <div className="flex items-center px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
                          <XCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Inactive</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {property.description && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {property.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center min-h-0">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {property.emails_sent}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Emails Sent
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center min-h-0">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-green-100 dark:bg-green-900 rounded-full">
                    <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {property.replies_received}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Replies
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center min-h-0">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {property.comparisons_available || 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Comparisons
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                Property Location
              </h2>
              <div style={{ height: "400px", width: "100%" }}>
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    property.address
                  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: "8px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Property Location"
                />
              </div>
            </div>

            {property.email_activity && property.email_activity.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                  Email Activity
                </h2>

                <div className="space-y-4">
                  {property.email_activity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4 ${
                          activity.type.toLowerCase().includes("sent")
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                            : "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                        }`}
                      >
                        {activity.type.toLowerCase().includes("sent") ? (
                          <Mail className="h-5 w-5" />
                        ) : (
                          <MessageSquare className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {activity.type}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(activity.date)}
                          </span>
                        </div>
                        {activity.description && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={fetchConversation}
                  disabled={loadingConversation}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Mail className="h-4 w-4" />
                  <span>
                    {loadingConversation ? "Loading..." : "View Emails"}
                  </span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <Bookmark className="h-4 w-4" />
                  <span>Save Property</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <BarChart3 className="h-4 w-4" />
                  <span>Generate Comparison</span>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {property.agent_name || "Property Agent"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {property.true_owner}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                  <span>{property.contact_email || "raviking2311@gmail.com"}</span>
                </div>
                {property.agent_phone && (
                  <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                    <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                    <span>{property.agent_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {property.showing_availability &&
              property.showing_availability.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-0">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                    Showing Availability
                  </h2>
                  <div className="space-y-2">
                    {property.showing_availability.map(
                      (availability, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">
                            {availability.day}
                          </span>
                          <span className="text-gray-600 dark:text-gray-300">
                            {availability.time}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Contacts:
                </span>
                {Array.from(
                  new Set(
                    conversation.map((email) =>
                      email.to.includes("raviking2311@gmail.com")
                        ? email.from
                        : email.to
                    )
                  )
                ).map((contact) => (
                  <span
                    key={contact}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                  >
                    {contact}
                  </span>
                ))}
              </div>
            </div>

            {property.utilities_included &&
              property.utilities_included.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-0">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                    Utilities Included
                  </h2>
                  <div className="grid grid-cols-1 gap-2">
                    {property.utilities_included.map((utility, index) => (
                      <div
                        key={index}
                        className="flex items-center p-2 bg-green-50 dark:bg-green-900/30 rounded-lg"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                        <span className="text-gray-900 dark:text-gray-100">
                          {utility}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {property.needs_attention && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl shadow-sm border border-orange-200 dark:border-orange-800/30 p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-800/30 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h2 className="text-lg font-bold text-orange-800 dark:text-orange-300">
                    Attention Required
                  </h2>
                </div>
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  This property has been flagged for attention. Please review
                  the latest comparisons and updates.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Email Conversation Modal */}
      {showConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-start justify-center p-4 pt-20">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[75vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Email Conversation - {property.address}
              </h2>
              <button
                onClick={() => setShowConversation(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {conversation.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No email conversation found
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group emails by contact person */}
                  {Object.entries(
                    conversation.reduce(
                      (groups: Record<string, EmailData[]>, email) => {
                        const contactKey = email.to.includes(
                          "raviking2311@gmail.com"
                        )
                          ? email.from
                          : email.to;
                        if (!groups[contactKey]) groups[contactKey] = [];
                        groups[contactKey].push(email);
                        return groups;
                      },
                      {} as Record<string, EmailData[]>
                    )
                  ).map(([contact, emails]: [string, EmailData[]]) => (
                    <div
                      key={contact}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-t-lg">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Conversation with {contact}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {emails.length} email{emails.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="p-4 space-y-4">
                        {emails.map((email, index) => (
                          <div
                            key={email.id || index}
                            className="border-l-4 border-gray-200 dark:border-gray-600 pl-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    email.from.includes("raviking2311@gmail.com")
                                      ? "bg-blue-500"
                                      : "bg-green-500"
                                  }`}
                                />
                                <span className="font-medium text-gray-900 dark:text-white text-sm">
                                  {email.from.includes("raviking2311@gmail.com")
                                    ? "You"
                                    : email.from}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(email.date).toLocaleString()}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                              {email.subject}
                            </h4>
                            <div className="text-gray-700 dark:text-gray-300 text-xs bg-gray-50 dark:bg-gray-800 rounded p-2">
                              <pre className="whitespace-pre-wrap font-sans">
                                {email.body || email.snippet}
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
