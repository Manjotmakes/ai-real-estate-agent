export const formatCurrency = (amount: number | string): string => {
  if (typeof amount === "string") {
    // Handle string amounts like "Withheld", "$27.50/SF", etc.
    if (amount.toLowerCase() === "withheld" || amount.toLowerCase() === "unknown") {
      return amount
    }
    return amount
  }

  if (typeof amount !== "number" || isNaN(amount)) {
    return "N/A"
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatNumber = (num: number | string): string => {
  if (typeof num === "string") {
    const parsed = Number.parseFloat(num)
    if (isNaN(parsed)) return num
    num = parsed
  }

  if (typeof num !== "number" || isNaN(num)) {
    return "N/A"
  }

  return new Intl.NumberFormat("en-US").format(num)
}

export const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return "Invalid Date"
  }
}

export const formatDateTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "Invalid Date"
  }
}
