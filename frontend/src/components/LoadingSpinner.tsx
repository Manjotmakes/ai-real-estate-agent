import { Loader2 } from "lucide-react"

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="text-lg text-gray-600">Loading...</span>
      </div>
    </div>
  )
}

export default LoadingSpinner
