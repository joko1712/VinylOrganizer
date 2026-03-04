import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CoverImagePickerProps {
  imageUri: string | null;
  onImageSelected: (uri: string | null) => void;
}

export function CoverImagePicker({ imageUri, onImageSelected }: CoverImagePickerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlText, setUrlText] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
    }
  };

  const handleUrlSubmit = () => {
    const trimmed = urlText.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
      return;
    }
    onImageSelected(trimmed);
    setShowUrlInput(false);
    setUrlText('');
  };

  return (
    <View style={styles.container}>
      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" />
          <Pressable style={styles.removeButton} onPress={() => onImageSelected(null)}>
            <IconSymbol name="xmark.circle.fill" size={24} color="#fff" />
          </Pressable>
        </View>
      ) : (
        <View style={[styles.placeholder, { backgroundColor: colors.icon + '20' }]}>
          <IconSymbol name="photo" size={40} color={colors.icon} />
          <ThemedText style={styles.placeholderText}>No cover image</ThemedText>
        </View>
      )}

      <View style={styles.buttons}>
        <Pressable
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={pickImage}
        >
          <IconSymbol name="photo" size={18} color="#fff" />
          <ThemedText style={styles.buttonText}>Gallery</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: Colors[colorScheme].card }]}
          onPress={() => setShowUrlInput(!showUrlInput)}
        >
          <ThemedText style={styles.urlButtonText}>URL</ThemedText>
        </Pressable>
      </View>

      {showUrlInput && (
        <View style={styles.urlContainer}>
          <TextInput
            style={[
              styles.urlInput,
              {
                color: colors.text,
                backgroundColor: Colors[colorScheme].card,
              },
            ]}
            value={urlText}
            onChangeText={setUrlText}
            placeholder="https://example.com/cover.jpg"
            placeholderTextColor={colors.icon}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            onSubmitEditing={handleUrlSubmit}
            returnKeyType="done"
          />
          <Pressable style={[styles.urlSubmit, { backgroundColor: colors.tint }]} onPress={handleUrlSubmit}>
            <ThemedText style={styles.buttonText}>Add</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  previewContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  placeholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 13,
    opacity: 0.6,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  urlButtonText: {
    fontWeight: '600',
  },
  urlContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  urlInput: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  urlSubmit: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
});
