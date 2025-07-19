export const useChat = () => {
  // Function to resolve badge color based on user status
  const resolveAvatarBadgeVariant = status => {
    if (status === 'online') {
      return 'success'  // Green for online users
    }
    if (status === 'busy') {
      return 'error'  // Red for busy users
    }
    if (status === 'away') {
      return 'warning'  // Yellow for away users
    }

    return 'secondary'  // Default color for other statuses
  }

  // Return the function so it can be used in other components
  return {
    resolveAvatarBadgeVariant,
  }
}
