const serverURL = "https://questify.nathanguianvarch.fr"

export const requestServer = async () => {
  try {
    const response = await fetch(serverURL)
    return response.ok
  } catch {
    return false
  }
}