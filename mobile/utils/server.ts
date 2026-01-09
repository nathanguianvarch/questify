export const requestServer = async () => {
  try {
    const response = await fetch(process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:3000")
    return response.ok
  } catch (e) {
    console.log(e)
    return false
  }
}