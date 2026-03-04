import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { VinylForm } from '@/components/vinyl/vinyl-form';
import { Colors } from '@/constants/theme';
import { useVinyls } from '@/context/vinyl-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function VinylDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { vinyls, updateVinyl, deleteVinyl } = useVinyls();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [isEditing, setIsEditing] = useState(false);

  const vinyl = vinyls.find((v) => v.id === id);

  if (!vinyl) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Vinyl not found</ThemedText>
      </ThemedView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Vinyl',
      `Are you sure you want to delete "${vinyl.albumName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteVinyl(vinyl.id);
            router.back();
          },
        },
      ],
    );
  };

  if (isEditing) {
    return (
      <ThemedView style={styles.container}>
        <VinylForm
          initialData={vinyl}
          submitLabel="Save Changes"
          onSubmit={async (data) => {
            await updateVinyl(vinyl.id, data);
            setIsEditing(false);
          }}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {vinyl.coverImageUri ? (
          <Image
            source={{ uri: vinyl.coverImageUri }}
            style={styles.cover}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.cover, styles.placeholder, { backgroundColor: colors.icon + '20' }]}>
            <ThemedText style={styles.placeholderText}>
              {vinyl.albumName.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
        )}

        <View style={styles.details}>
          <ThemedText type="title">{vinyl.albumName}</ThemedText>
          <ThemedText type="subtitle" style={styles.artist}>
            {vinyl.artist}
          </ThemedText>

          {(vinyl.year || vinyl.genre) && (
            <View style={styles.meta}>
              {vinyl.year && <ThemedText style={styles.metaText}>{vinyl.year}</ThemedText>}
              {vinyl.year && vinyl.genre ? <ThemedText style={styles.metaText}> / </ThemedText> : null}
              {vinyl.genre && <ThemedText style={styles.metaText}>{vinyl.genre}</ThemedText>}
            </View>
          )}

          {vinyl.notes ? (
            <View style={styles.notesSection}>
              <ThemedText style={styles.notesLabel}>Notes</ThemedText>
              <ThemedText style={styles.notesText}>{vinyl.notes}</ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.tint }]}
            onPress={() => setIsEditing(true)}
          >
            <IconSymbol name="pencil" size={18} color="#fff" />
            <ThemedText style={styles.actionText}>Edit</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
            onPress={handleDelete}
          >
            <IconSymbol name="trash" size={18} color="#fff" />
            <ThemedText style={styles.actionText}>Delete</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 72,
    fontWeight: '700',
    opacity: 0.3,
  },
  details: {
    padding: 20,
    gap: 4,
  },
  artist: {
    opacity: 0.7,
  },
  meta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  metaText: {
    opacity: 0.5,
    fontSize: 15,
  },
  notesSection: {
    marginTop: 20,
    gap: 6,
  },
  notesLabel: {
    fontWeight: '600',
    opacity: 0.6,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
