export const requestPreviewSongAudio = async (id: string) => {
  const response = await fetch(`https://open.spotify.com/embed/track/${id}`)
  const result = await response.text()
  const previewUrl = result.split('"audioPreview":{"url":"')[1].split('"')[0]
  return previewUrl
}