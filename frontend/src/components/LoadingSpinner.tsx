import { Loader2, Sparkles } from "lucide-react"

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center shadow-lg">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
          <div className="absolute -top-2 -right-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white animate-pulse" />
            </div>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-primary mb-2">Loading...</h3>
        <p className="text-secondary">Please wait while we fetch your data</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
