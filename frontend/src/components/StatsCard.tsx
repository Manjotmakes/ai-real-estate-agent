import type React from "react"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: "blue" | "green" | "purple" | "orange"
  subtitle?: string
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue: "from-blue-500/20 to-cyan-600/20 border-blue-400/30",
    green: "from-green-500/20 to-emerald-600/20 border-green-400/30",
    purple: "from-purple-500/20 to-violet-600/20 border-purple-400/30",
    orange: "from-orange-500/20 to-red-600/20 border-orange-400/30",
  }

  const iconColors = {
    blue: "text-blue-300",
    green: "text-green-300",
    purple: "text-purple-300",
    orange: "text-orange-300",
  }

  return (
    <div className={`glass rounded-2xl p-6 card-hover bg-gradient-to-br ${colorClasses[color]} border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</p>
          {subtitle && <p className="text-white/60 text-xs">{subtitle}</p>}
        </div>
        <div className="p-4 glass rounded-2xl">
          <Icon className={`h-8 w-8 ${iconColors[color]}`} />
        </div>
      </div>
    </div>
  )
}

export default StatsCard
