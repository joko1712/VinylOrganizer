import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useVinyls } from '@/context/vinyl-context';

export default function SettingsScreen() {
  const { vinyls } = useVinyls();

  const genreCounts = vinyls.reduce<Record<string, number>>((acc, v) => {
    const g = v.genre || 'Uncategorized';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});

  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.section}>
        <ThemedText type="subtitle">Collection Stats</ThemedText>
        <View style={styles.stat}>
          <ThemedText style={styles.statLabel}>Total Records</ThemedText>
          <ThemedText style={styles.statValue}>{vinyls.length}</ThemedText>
        </View>
        {topGenres.length > 0 && (
          <>
            <ThemedText style={styles.sectionTitle}>Top Genres</ThemedText>
            {topGenres.map(([genre, count]) => (
              <View key={genre} style={styles.stat}>
                <ThemedText style={styles.statLabel}>{genre}</ThemedText>
                <ThemedText style={styles.statValue}>{count}</ThemedText>
              </View>
            ))}
          </>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">About</ThemedText>
        <ThemedText style={styles.about}>
          VinylOrganizer v1.0.0
        </ThemedText>
        <ThemedText style={styles.aboutDetail}>
          Catalog your vinyl collection and plan the perfect display.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    gap: 12,
    marginBottom: 32,
  },
  sectionTitle: {
    fontWeight: '600',
    marginTop: 8,
    opacity: 0.7,
  },
  stat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  about: {
    fontSize: 15,
    opacity: 0.6,
  },
  aboutDetail: {
    fontSize: 14,
    opacity: 0.5,
    lineHeight: 20,
  },
});
