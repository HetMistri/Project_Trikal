// Data formatting utilities
export const formatUtils = {
  // Format timestamp for display
  formatTimestamp(timestamp, format = "full") {
    const date = new Date(timestamp);

    switch (format) {
      case "date":
        return date.toLocaleDateString();
      case "time":
        return date.toLocaleTimeString();
      case "relative":
        return this.getRelativeTime(date);
      case "full":
      default:
        return date.toLocaleString();
    }
  },

  // Get relative time (e.g., "2 hours ago")
  getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  },

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Format percentage
  formatPercentage(value, decimals = 1) {
    return `${parseFloat(value).toFixed(decimals)}%`;
  },

  // Format elevation
  formatElevation(meters) {
    if (meters > 1000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${meters}m`;
  },

  // Truncate text with ellipsis
  truncateText(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  },

  // Capitalize first letter
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Format analysis confidence
  getConfidenceLevel(confidence) {
    if (confidence >= 90) return { level: "High", color: "green" };
    if (confidence >= 70) return { level: "Medium", color: "yellow" };
    return { level: "Low", color: "red" };
  },
};
