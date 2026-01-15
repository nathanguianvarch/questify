import { spotifyApiURL } from "@/routes/spotify.routes"
import { Track } from "shared"

export const requestPreviewSongAudio = async (id: string) => {
  const response = await fetch(`https://open.spotify.com/embed/track/${id}`)
  const result = await response.text()
  const previewUrl = result.split('"audioPreview":{"url":"')[1].split('"')[0]
  return previewUrl
}

export const requestArtistTopTracks = async (artistId: string, authorization: string): Promise<Track[]> => {

  let url = new URL(`${spotifyApiURL}/artists/${artistId}/top-tracks`);

  const response = await fetch(url, {
    headers: {
      "Authorization": authorization
    }
  })

  if (response.ok) {
    const result = await response.json();
    const tracks = result.tracks.map((item: any) => {
      return { id: item.id, title: item.name, artists: item.artists, cover: item.album.images[0].url };
    });
    return tracks;
  } else {
    throw new Error("Failed to fetch artist top tracks");
  }
}

export const requestTrack = async (trackId: string, authorization: string): Promise<Track> => {

  let url = new URL(`${spotifyApiURL}/tracks/${trackId}`);

  const response = await fetch(url, {
    headers: {
      "Authorization": authorization
    }
  })

  if (response.ok) {
    const result = await response.json();
    return { id: result.id, title: result.name, artists: result.artists, cover: result.album.images[0].url };
  } else {
    throw new Error("Failed to fetch track");
  }
}