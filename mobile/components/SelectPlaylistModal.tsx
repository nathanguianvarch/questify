import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Album, MusicSource, Playlist } from "shared";
import Button from "./ui/Button";

type SelectPlaylistModalProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  selectedMusicSource?: MusicSource;
  onSelect: (musicSource?: MusicSource, title?: string) => void;
};

export default function SelectPlaylistModal({
  visible,
  setVisible,
  selectedMusicSource,
  onSelect,
}: SelectPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const playlistResponse = await fetch(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/playlist/most-played?limit=20`,
      );
      const playlistData: Playlist[] = await playlistResponse.json();
      setPlaylists(playlistData);
      const albumResponse = await fetch(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/album/most-played?limit=20`,
      );
      const albumData: Album[] = await albumResponse.json();
      setAlbums(albumData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timeoutId = setTimeout(fetchData, 0);
    return () => clearTimeout(timeoutId);
  }, [visible, fetchData]);

  const change = (musicSource: MusicSource | undefined, title?: string) => {
    onSelect(musicSource, title);
    setVisible(false);
  };
  return (
    <Modal
      presentationStyle="pageSheet"
      animationType="slide"
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View className="flex-1 gap-4 bg-black p-4 border border-1">
        <View className="bg-white/50 w-16 h-1 rounded-full mx-auto mt-2"></View>
        <View>
          <Text className="text-white text-center font-semibold text-2xl">
            Thème musical
          </Text>
        </View>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#ffffff" size="large" />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center gap-4">
            <Text className="text-white/60 text-lg font-semibold text-center">
              Impossible de charger les thèmes musicaux
            </Text>
            <Button onClick={fetchData} className="self-center px-8">
              Réessayer
            </Button>
          </View>
        ) : (
          <View>
            <View className="flex flex-col gap-3">
              <Text className="text-white text-3xl font-bold">Playlists</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex flex-row gap-4">
                  {playlists.map((playlist, index) => (
                    <TouchableOpacity
                      key={playlist.id}
                      className={`w-[150px] flex flex-col gap-1.5 ${selectedMusicSource ? (selectedMusicSource.type === "playlist" && selectedMusicSource.id === playlist.id ? "opacity-100" : "opacity-70") : index === 0 ? "opacity-100" : "opacity-70"}`}
                      onPress={() =>
                        change(
                          { type: "playlist", id: playlist.id },
                          playlist.title,
                        )
                      }
                    >
                      <Image
                        className={`w-[150px] h-[150px] rounded-xl ${selectedMusicSource && selectedMusicSource.id === playlist.id ? "opacity-100 border-4 border-white" : "opacity-70"}`}
                        src={playlist.cover}
                      />
                      <Text className="text-white text-lg font-semibold line-clamp-2">
                        {playlist.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            <View className="flex flex-col gap-3">
              <Text className="text-white text-3xl font-bold">Albums</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex flex-row gap-4">
                  {albums.map((album) => (
                    <TouchableOpacity
                      key={album.id}
                      className={`w-[150px] h-auto flex flex-col gap-1.5 ${selectedMusicSource?.type === "album" && selectedMusicSource.id === album.id ? "opacity-100" : "opacity-70"}`}
                      onPress={() =>
                        change({ type: "album", id: album.id }, album.title)
                      }
                    >
                      <Image
                        className={`w-[150px] h-[150px] rounded-xl ${selectedMusicSource?.type === "album" && selectedMusicSource.id === album.id ? "opacity-100 border-4 border-white" : "opacity-70"}`}
                        src={album.cover}
                      />
                      <View>
                        <Text className="text-white text-lg font-semibold line-clamp-2">
                          {album.title}
                        </Text>
                        <Text className="text-white/50 text-lg font-semibold">
                          {album.artists
                            .map((artist) => artist.name)
                            .join(", ")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
