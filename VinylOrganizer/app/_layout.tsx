import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { VinylProvider } from '@/context/vinyl-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <VinylProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="vinyl/add" options={{ presentation: 'modal', title: 'Add Vinyl' }} />
          <Stack.Screen name="vinyl/[id]" options={{ presentation: 'modal', title: 'Vinyl Details' }} />
          <Stack.Screen name="vinyl/scan" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        </Stack>
      </VinylProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
