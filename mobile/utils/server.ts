export const requestServer = async () => {
  try {
    const response = await fetch(process.env.EXPO_PUBLIC_SERVERURL ?? "http://localhost:3000")
    console.log(response)
    return response.ok
  } catch (e) {
    console.log(e)
    return false
  }
}