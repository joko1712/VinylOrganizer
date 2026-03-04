import { Image } from "expo-image";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CoverImagePicker } from "@/components/vinyl/cover-image-picker";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AlbumSearchResult, searchVinyls } from "@/services/discogs";
import { VinylRecord } from "@/types/vinyl";
import { useRouter } from "expo-router";

type VinylFormData = Omit<VinylRecord, "id" | "createdAt" | "updatedAt">;

interface VinylFormProps {
    initialData?: Partial<VinylFormData>;
    onSubmit: (data: VinylFormData) => void;
    submitLabel?: string;
}

export function VinylForm({
    initialData,
    onSubmit,
    submitLabel = "Save",
}: VinylFormProps) {
    const colorScheme = useColorScheme() ?? "light";
    const colors = Colors[colorScheme];
    const router = useRouter();

    const [albumName, setAlbumName] = useState(initialData?.albumName ?? "");
    const [artist, setArtist] = useState(initialData?.artist ?? "");
    const [year, setYear] = useState(initialData?.year?.toString() ?? "");
    const [genre, setGenre] = useState(initialData?.genre ?? "");
    const [coverImageUri, setCoverImageUri] = useState<string | null>(
        initialData?.coverImageUri ?? null,
    );
    const [notes, setNotes] = useState(initialData?.notes ?? "");

    const [searchResults, setSearchResults] = useState<AlbumSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [searchError, setSearchError] = useState(false);

    const handleSearch = useCallback(async () => {
        if (!albumName.trim()) return;
        setIsSearching(true);
        setShowResults(true);
        setSearchError(false);
        try {
            const results = await searchVinyls(albumName);
            setSearchResults(results);
        } catch {
            setSearchError(true);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [albumName]);

    const handleSelectResult = (result: AlbumSearchResult) => {
        setAlbumName(result.albumName);
        setArtist(result.artist);
        setYear(result.year);
        setGenre(result.genre);
        if (result.coverImageUri) {
            setCoverImageUri(result.coverImageUri);
        }
        setShowResults(false);
        setSearchResults([]);
    };

    const handleSubmit = () => {
        if (!albumName.trim()) {
            Alert.alert("Required", "Album name is required");
            return;
        }
        if (!artist.trim()) {
            Alert.alert("Required", "Artist name is required");
            return;
        }

        const parsedYear = year.trim() ? parseInt(year.trim(), 10) : null;
        if (
            parsedYear !== null &&
            (isNaN(parsedYear) ||
                parsedYear < 1900 ||
                parsedYear > new Date().getFullYear())
        ) {
            Alert.alert("Invalid Year", "Please enter a valid year");
            return;
        }

        onSubmit({
            albumName: albumName.trim(),
            artist: artist.trim(),
            year: parsedYear,
            genre: genre.trim(),
            coverImageUri,
            notes: notes.trim(),
        });
    };

    const inputStyle = [
        styles.input,
        {
            color: colors.text,
            backgroundColor: Colors[colorScheme].card,
        },
    ];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps='handled'>
                <CoverImagePicker
                    imageUri={coverImageUri}
                    onImageSelected={setCoverImageUri}
                />

                <View style={styles.field}>
                    <ThemedText style={styles.label}>Album Name *</ThemedText>
                    <View style={styles.searchRow}>
                        <TextInput
                            style={[...inputStyle, styles.searchInput]}
                            value={albumName}
                            onChangeText={(text) => {
                                setAlbumName(text);
                                if (showResults) setShowResults(false);
                            }}
                            placeholder='Enter album name'
                            placeholderTextColor={colors.icon}
                            returnKeyType='search'
                            onSubmitEditing={handleSearch}
                        />
                        <Pressable
                            style={[
                                styles.searchButton,
                                { backgroundColor: colors.tint },
                            ]}
                            onPress={handleSearch}
                            disabled={isSearching || !albumName.trim()}>
                            {isSearching ? (
                                <ActivityIndicator size='small' color='#fff' />
                            ) : (
                                <IconSymbol
                                    name='magnifyingglass'
                                    size={20}
                                    color='#fff'
                                />
                            )}
                        </Pressable>
                    </View>

                    {showResults && (
                        <View
                            style={[
                                styles.resultsContainer,
                                { backgroundColor: Colors[colorScheme].card },
                            ]}>
                            {isSearching && (
                                <View style={styles.resultsMessage}>
                                    <ActivityIndicator
                                        size='small'
                                        color={colors.tint}
                                    />
                                    <ThemedText
                                        style={styles.resultsMessageText}>
                                        Searching Discogs...
                                    </ThemedText>
                                </View>
                            )}
                            {!isSearching && searchError && (
                                <View style={styles.resultsMessage}>
                                    <ThemedText
                                        style={styles.resultsMessageText}>
                                        Search failed. Try again.
                                    </ThemedText>
                                </View>
                            )}
                            {!isSearching &&
                                !searchError &&
                                searchResults.length === 0 && (
                                    <View style={styles.resultsMessage}>
                                        <ThemedText
                                            style={styles.resultsMessageText}>
                                            No vinyl releases found
                                        </ThemedText>
                                    </View>
                                )}
                            {!isSearching &&
                                searchResults.map((result) => (
                                    <Pressable
                                        key={result.discogsId}
                                        style={({ pressed }) => [
                                            styles.resultRow,
                                            {
                                                borderBottomColor:
                                                    colors.icon + "20",
                                            },
                                            pressed && { opacity: 0.6 },
                                        ]}
                                        onPress={() =>
                                            handleSelectResult(result)
                                        }>
                                        {result.coverImageUri ? (
                                            <Image
                                                source={{
                                                    uri: result.coverImageUri,
                                                }}
                                                style={styles.resultThumb}
                                                contentFit='cover'
                                            />
                                        ) : (
                                            <View
                                                style={[
                                                    styles.resultThumb,
                                                    styles.resultThumbPlaceholder,
                                                    {
                                                        backgroundColor:
                                                            colors.icon + "20",
                                                    },
                                                ]}
                                            />
                                        )}
                                        <View style={styles.resultInfo}>
                                            <ThemedText
                                                numberOfLines={1}
                                                style={styles.resultAlbum}>
                                                {result.albumName}
                                            </ThemedText>
                                            <ThemedText
                                                numberOfLines={1}
                                                style={styles.resultArtist}>
                                                {result.artist}
                                                {result.year
                                                    ? ` \u00B7 ${result.year}`
                                                    : ""}
                                            </ThemedText>
                                        </View>
                                    </Pressable>
                                ))}
                        </View>
                    )}
                </View>

                <View style={styles.field}>
                    <ThemedText style={styles.label}>Artist *</ThemedText>
                    <TextInput
                        style={inputStyle}
                        value={artist}
                        onChangeText={setArtist}
                        placeholder='Enter artist name'
                        placeholderTextColor={colors.icon}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.field, styles.halfField]}>
                        <ThemedText style={styles.label}>Year</ThemedText>
                        <TextInput
                            style={inputStyle}
                            value={year}
                            onChangeText={setYear}
                            placeholder='e.g. 1977'
                            placeholderTextColor={colors.icon}
                            keyboardType='number-pad'
                            maxLength={4}
                        />
                    </View>
                    <View style={[styles.field, styles.halfField]}>
                        <ThemedText style={styles.label}>Genre</ThemedText>
                        <TextInput
                            style={inputStyle}
                            value={genre}
                            onChangeText={setGenre}
                            placeholder='e.g. Rock'
                            placeholderTextColor={colors.icon}
                        />
                    </View>
                </View>

                <View style={styles.field}>
                    <ThemedText style={styles.label}>Notes</ThemedText>
                    <TextInput
                        style={[...inputStyle, styles.notesInput]}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder='Any additional notes...'
                        placeholderTextColor={colors.icon}
                        multiline
                        textAlignVertical='top'
                    />
                </View>
                <View style={[styles.row]}>
                    <Pressable
                        style={[
                            styles.submitButton,
                            { backgroundColor: colors.tint },
                        ]}
                        onPress={handleSubmit}>
                        <ThemedText style={styles.submitText}>
                            {submitLabel}
                        </ThemedText>
                    </Pressable>
                    <Pressable
                        onPress={() => router.push("/vinyl/scan")}
                        hitSlop={8}
                        style={styles.qrButton}>
                        <IconSymbol
                            size={50}
                            name='barcode.viewfinder'
                            color={Colors[colorScheme ?? "light"].tint}
                        />
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        gap: 16,
        paddingBottom: 40,
    },
    field: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        opacity: 0.8,
    },
    input: {
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
    },
    searchRow: {
        flexDirection: "row",
        gap: 8,
    },
    searchInput: {
        flex: 1,
    },
    searchButton: {
        width: 44,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    resultsContainer: {
        borderRadius: 10,
        overflow: "hidden",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    resultsMessage: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 16,
    },
    resultsMessageText: {
        fontSize: 14,
        opacity: 0.6,
    },
    resultRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        gap: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    resultThumb: {
        width: 50,
        height: 50,
        borderRadius: 6,
    },
    resultThumbPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 6,
    },
    resultInfo: {
        flex: 1,
        gap: 2,
    },
    resultAlbum: {
        fontSize: 15,
        fontWeight: "600",
    },
    resultArtist: {
        fontSize: 13,
        opacity: 0.6,
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    halfField: {
        flex: 1,
    },
    notesInput: {
        minHeight: 80,
        paddingTop: 12,
    },
    submitButton: {
        alignItems: "center",
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 8,
        width: "85%",
    },
    submitText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
    },
    qrButton: {
        alignItems: "center",
        borderRadius: 12,
        marginTop: 8,
    },
});
