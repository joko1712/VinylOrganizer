import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { VinylRecord } from '@/types/vinyl';

interface VinylCardProps {
  vinyl: VinylRecord;
  onPress: () => void;
}

export function VinylCard({ vinyl, onPress }: VinylCardProps) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: Colors[colorScheme].card },
      ]}
      onPress={onPress}
    >
      {vinyl.coverImageUri ? (
        <Image
          source={{ uri: vinyl.coverImageUri }}
          style={styles.cover}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.cover, styles.placeholder, { backgroundColor: Colors[colorScheme].icon + '30' }]}>
          <ThemedText style={styles.placeholderText}>
            {vinyl.albumName.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
      )}
      <View style={styles.info}>
        <ThemedText numberOfLines={1} style={styles.albumName}>
          {vinyl.albumName}
        </ThemedText>
        <ThemedText numberOfLines={1} style={styles.artist}>
          {vinyl.artist}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  cover: {
    aspectRatio: 1,
    width: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 36,
    fontWeight: '700',
    opacity: 0.5,
  },
  info: {
    padding: 8,
    gap: 2,
  },
  albumName: {
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    fontSize: 12,
    opacity: 0.7,
  },
});
