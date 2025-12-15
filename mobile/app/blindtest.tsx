import Input from "@/components/Input";
import { requestPreviewSongAudio, requestSongInfos } from "@/utils/spotify";
import { useAudioPlayer } from "expo-audio";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Bouton from "../components/Button";

export default function BlindTest() {
  const [spotifySongUrl, setSpotifySongUrl] = useState({
    cover: "",
    title: "Pensionman",
    artist: "Vald",
    url: "4eGoCBOGEAQty5nfWRC0VD",
  });
  const [song1, setSong1] = useState("");
  const player1 = useAudioPlayer(song1, { downloadFirst: true });

  const playSong1 = async () => {
    const url1 = await requestPreviewSongAudio(spotifySongUrl.url);
    const songInfo = await requestSongInfos(spotifySongUrl.url);
    setSpotifySongUrl({
      artist: songInfo.artist,
      cover: songInfo.cover,
      title: songInfo.title,
      url: spotifySongUrl.url,
    });

    setSong1(url1);
    player1.play();
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex gap-4">
        <View className="flex gap-2.5">
          <Input
            value={spotifySongUrl.url}
            onChangeText={(value) =>
              setSpotifySongUrl({
                url: spotifySongUrl.url,
                cover: spotifySongUrl.cover,
                title: spotifySongUrl.title,
                artist: spotifySongUrl.artist,
              })
            }
          ></Input>
          <Bouton onClick={playSong1} backgroundColor="info">
            play
          </Bouton>
        </View>
        <Bouton
          onClick={() => {
            player1.pause();
          }}
          backgroundColor="info"
        >
          pause
        </Bouton>
        {spotifySongUrl.title &&
        spotifySongUrl.artist &&
        spotifySongUrl.cover ? (
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex flex-row gap-3 items-center bg-white/10 rounded-3xl p-2"
          >
            <Image
              className="w-20 h-20 rounded-2xl"
              source={{ uri: spotifySongUrl.cover }}
            />
            <View className="flex">
              <Text className="text-white font-bold text-2xl">
                {spotifySongUrl.title}
              </Text>
              <Text className="text-white/50 font-semibold">
                {spotifySongUrl.artist}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          ""
        )}
      </View>
    </SafeAreaView>
  );
}
