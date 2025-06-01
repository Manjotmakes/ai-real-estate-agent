const API_BASE_URL = "http://127.0.0.1:8000"

// Type definitions
export interface DashboardSummary {
  total_properties: number
  properties_with_emails: number
  total_emails_sent: number // Added this field
  total_replies: number
  total_comparisons: number
  comparisons_needing_attention: number
  recent_comparisons: Comparison[]
  last_updated: string
}

export interface Property {
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
  property_type?: string
  contact_email?: string
  status?: string
  email_sent?: boolean
  reply_received?: boolean
  last_updated?: string
}

export interface PropertiesWithStatus {
  properties: Property[]
  total_count: number
}

export interface RentAnalysis {
  original: string
  updated: string
  change_type: string
}

export interface AvailabilityAnalysis {
  original_sf: number
  updated_sf: number
  change_type: string
}

export interface Comparison {
  _id?: string
  property_id: string
  property_address: string
  comparison_summary: string
  requires_attention: boolean
  comparison_date: string
  rent_analysis?: RentAnalysis
  availability_analysis?: AvailabilityAnalysis
  market_signal?: string
}

export interface ComparisonsResponse {
  comparisons: Comparison[]
  total_count: number
}

export interface PropertyDetails {
  property: Property
  comparisons?: Comparison[]
  email_history?: any[]
  replies?: any[]
}

export interface Reply {
  _id: string
  property_id: string
  sender_email: string
  subject: string
  body: string
  received_date: string
  processed: boolean
}

export interface RepliesResponse {
  replies: Reply[]
  total_count: number
}

class ApiService {
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Network error" }))
        throw new Error(error.message || `HTTP error! status: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Dashboard endpoints
  getDashboardSummary = async (): Promise<DashboardSummary> => {
    return this.request<DashboardSummary>("/dashboard-summary/")
  }

  getPropertiesWithStatus = async (): Promise<PropertiesWithStatus> => {
    return this.request<PropertiesWithStatus>("/properties-with-status/")
  }

  getComparisons = async (): Promise<ComparisonsResponse> => {
    return this.request<ComparisonsResponse>("/comparisons/")
  }

  // Property endpoints
  getProperties = async (): Promise<{ properties: Property[] }> => {
    return this.request<{ properties: Property[] }>("/properties/")
  }

  getPropertyDetails = async (id: string): Promise<PropertyDetails> => {
    return this.request<PropertyDetails>(`/property/${id}/details/`)
  }

  // Email endpoints
  sendEmails = async (): Promise<{ message: string }> => {
    return this.request<{ message: string }>("/send-emails/", { method: "POST" })
  }

  processReplies = async (): Promise<{ message: string }> => {
    return this.request<{ message: string }>("/process-replies/", { method: "POST" })
  }

  generateComparisons = async (): Promise<{ message: string }> => {
    return this.request<{ message: string }>("/generate-comparisons/", { method: "POST" })
  }

  // File upload
  uploadPDF = async (file: File): Promise<{ message: string }> => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`${API_BASE_URL}/upload-pdf/`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Upload failed" }))
        throw new Error(error.message || `HTTP error! status: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error("PDF upload failed:", error)
      throw error
    }
  }

  // Replies
  getReplies = async (): Promise<RepliesResponse> => {
    return this.request<RepliesResponse>("/replies/")
  }
}

export const api = new ApiService()
