import { COLORS } from "@/constants/theme";
import { Check } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  MusicSearchResults,
  MusicSection,
  MusicSource,
  MusicSourceItem,
} from "shared";
import Button from "./ui/Button";
import Input from "./ui/Input";

type SelectPlaylistModalProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  selectedMusicSource?: MusicSource;
  onSelect: (musicSource?: MusicSource, title?: string) => void;
};

const SEARCH_DEBOUNCE_MS = 350;
const MIN_SEARCH_LENGTH = 2;

export default function SelectPlaylistModal({
  visible,
  setVisible,
  selectedMusicSource,
  onSelect,
}: SelectPlaylistModalProps) {
  const { t, i18n } = useTranslation();
  const [sections, setSections] = useState<MusicSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<{
    term: string;
    results: MusicSearchResults | null;
  } | null>(null);

  const language = i18n.language;
  const term = query.trim();
  const isSearching = term.length >= MIN_SEARCH_LENGTH;

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/music/recommendations?limit=20&lang=${language}`,
      );
      if (!response.ok) throw new Error("recommendations failed");
      setSections(await response.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    if (!visible) return;
    const timeoutId = setTimeout(fetchRecommendations, 0);
    return () => clearTimeout(timeoutId);
  }, [visible, fetchRecommendations]);

  useEffect(() => {
    if (!visible || !isSearching) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/music/search?term=${encodeURIComponent(term)}&limit=25&lang=${language}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("search failed");
        setSearch({ term, results: await response.json() });
      } catch {
        if (controller.signal.aborted) return;
        setSearch({ term, results: null });
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [visible, isSearching, term, language]);

  const close = () => {
    setQuery("");
    setVisible(false);
  };

  const isSelected = useCallback(
    (item: MusicSourceItem) =>
      selectedMusicSource?.type === item.type &&
      selectedMusicSource.id === item.id,
    [selectedMusicSource],
  );

  const select = (item: MusicSourceItem) => {
    onSelect({ type: item.type, id: item.id }, item.title);
    close();
  };

  const currentSearch = search?.term === term ? search : null;
  const searchItems = useMemo(() => {
    if (!currentSearch?.results) return [];
    return [
      ...currentSearch.results.playlists,
      ...currentSearch.results.albums,
    ];
  }, [currentSearch]);

  const renderCard = (item: MusicSourceItem) => {
    const selected = isSelected(item);
    return (
      <TouchableOpacity
        key={`${item.type}-${item.id}`}
        className="w-[150px] flex flex-col gap-1.5"
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={item.title}
        onPress={() => select(item)}
      >
        <View className="w-[150px] h-[150px] rounded-xl overflow-hidden">
          <Image
            className={`w-full h-full rounded-xl ${selected ? "border-[3px]" : ""}`}
            style={selected ? { borderColor: COLORS.primary } : undefined}
            source={{ uri: item.cover }}
          />
          {selected && (
            <View
              className="absolute bottom-2 right-2 w-7 h-7 rounded-full items-center justify-center"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Check height={18} width={18} color="#000000" strokeWidth={3} />
            </View>
          )}
        </View>
        <View>
          <Text className="text-white text-lg font-semibold" numberOfLines={2}>
            {item.title}
          </Text>
          {!!item.subtitle && (
            <Text
              className="text-white/50 text-base font-semibold"
              numberOfLines={1}
            >
              {item.subtitle}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderRow = (item: MusicSourceItem) => {
    const selected = isSelected(item);
    return (
      <TouchableOpacity
        key={`${item.type}-${item.id}`}
        className="flex flex-row items-center gap-3 py-2"
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={item.title}
        onPress={() => select(item)}
      >
        <Image
          className={`w-16 h-16 rounded-lg ${selected ? "border-2" : ""}`}
          style={selected ? { borderColor: COLORS.primary } : undefined}
          source={{ uri: item.cover }}
        />
        <View className="flex-1">
          <Text className="text-white text-lg font-semibold" numberOfLines={1}>
            {item.title}
          </Text>
          <Text
            className="text-white/50 text-base font-semibold"
            numberOfLines={1}
          >
            {[
              t(
                item.type === "playlist"
                  ? "settings.playlist"
                  : "settings.album",
              ),
              item.subtitle,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>
        {selected && (
          <Check
            height={22}
            width={22}
            color={COLORS.primary}
            strokeWidth={3}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderSearchResults = () => {
    if (!currentSearch) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ffffff" size="large" />
        </View>
      );
    }
    if (!currentSearch.results) {
      return (
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-white/60 text-lg font-semibold text-center">
            {t("settings.searchFailed")}
          </Text>
        </View>
      );
    }
    if (searchItems.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white/60 text-lg font-semibold text-center">
            {t("settings.searchNoResults", { term })}
          </Text>
        </View>
      );
    }
    return (
      <FlatList
        data={searchItems}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={({ item }) => renderRow(item)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderRecommendations = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ffffff" size="large" />
        </View>
      );
    }
    if (error) {
      return (
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-white/60 text-lg font-semibold text-center">
            {t("settings.loadThemesFailed")}
          </Text>
          <Button onClick={fetchRecommendations} className="self-center px-8">
            {t("common.retry")}
          </Button>
        </View>
      );
    }
    return (
      <FlatList
        data={sections}
        keyExtractor={(section) => section.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-6 pb-4"
        renderItem={({ item: section }) => (
          <View className="flex flex-col gap-3">
            <Text className="text-white text-2xl font-bold">
              {section.title}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="flex flex-row gap-4">
                {section.items.map(renderCard)}
              </View>
            </ScrollView>
          </View>
        )}
      />
    );
  };

  return (
    <Modal
      presentationStyle="pageSheet"
      animationType="slide"
      visible={visible}
      onRequestClose={close}
    >
      <View className="flex-1 gap-4 bg-black p-4 border border-1">
        <View className="bg-white/50 w-16 h-1 rounded-full mx-auto mt-2"></View>
        <View>
          <Text className="text-white text-center font-semibold text-2xl">
            {t("settings.musicTheme")}
          </Text>
        </View>
        <Input value={query} onChangeText={setQuery} />
        {query.trim().length > 0 && !isSearching ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-white/60 text-lg font-semibold text-center">
              {t("settings.searchTooShort")}
            </Text>
          </View>
        ) : isSearching ? (
          renderSearchResults()
        ) : (
          renderRecommendations()
        )}
      </View>
    </Modal>
  );
}
