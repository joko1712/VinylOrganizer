import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fab } from '@/components/ui/fab';
import { SearchBar } from '@/components/ui/search-bar';
import { EmptyCollection } from '@/components/vinyl/empty-collection';
import { VinylCard } from '@/components/vinyl/vinyl-card';
import { useVinyls } from '@/context/vinyl-context';

export default function CollectionScreen() {
  const { vinyls, isLoading } = useVinyls();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return vinyls;
    const q = search.toLowerCase();
    return vinyls.filter(
      (v) =>
        v.albumName.toLowerCase().includes(q) ||
        v.artist.toLowerCase().includes(q) ||
        v.genre.toLowerCase().includes(q),
    );
  }, [vinyls, search]);

  const navigateToAdd = () => router.push('/vinyl/add');
  const navigateToScan = () => router.push('/vinyl/scan');

  if (!isLoading && vinyls.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <EmptyCollection onAddPress={navigateToAdd} onScanPress={navigateToScan} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search vinyls..." />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <VinylCard
            vinyl={item}
            onPress={() => router.push(`/vinyl/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          search.trim() ? (
            <View style={styles.noResults}>
              <ThemedText style={styles.noResultsText}>No matching vinyls found</ThemedText>
            </View>
          ) : null
        }
      />
      <Fab onPress={navigateToAdd} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 10,
    paddingBottom: 80,
  },
  noResults: {
    padding: 32,
    alignItems: 'center',
  },
  noResultsText: {
    opacity: 0.6,
    fontSize: 16,
  },
});
