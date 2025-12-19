export const requestServer = async () => {
  try {
    const response = await fetch(process.env.EXPO_PUBLIC_SERVERURL ?? "http://localhost:3000")
    return response.ok
  } catch {
    return false
  }
}