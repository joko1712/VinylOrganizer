import {
    BarcodeScanningResult,
    CameraView,
    useCameraPermissions,
} from "expo-camera";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    Pressable,
    StyleSheet,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useOcrRecognition } from "@/hooks/use-ocr-recognition";
import { AlbumSearchResult, searchByBarcode } from "@/services/discogs";

type RecognitionSource = "barcode" | "ocr";

type ScanState =
    | { kind: "idle" }
    | { kind: "searching"; source: RecognitionSource; query: string }
    | { kind: "found"; source: RecognitionSource; results: AlbumSearchResult[] }
    | { kind: "not-found"; source: RecognitionSource; query: string };

export default function ScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanState, setScanState] = useState<ScanState>({ kind: "idle" });
    const [enableTorch, setEnableTorch] = useState(false);
    const [ocrEnabled, setOcrEnabled] = useState(true);
    const cameraRef = useRef<CameraView>(null);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? "light";
    const colors = Colors[colorScheme];

    const { ocrStatus, ocrResults, ocrQuery, dismissOcrResults } =
        useOcrRecognition({
            cameraRef,
            enabled: ocrEnabled,
            scanStateKind: scanState.kind,
        });

    const showOcrResults = ocrResults && scanState.kind === "idle";

    if (!permission) {
        return <View style={[styles.container, { backgroundColor: "#000" }]} />;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, styles.permissionContainer]}>
                <IconSymbol name='camera' size={64} color={colors.icon} />
                <ThemedText type='title' style={styles.permissionTitle}>
                    Camera Access
                </ThemedText>
                <ThemedText style={styles.permissionText}>
                    VinylOrganizer needs camera access to scan barcodes and take
                    cover photos.
                </ThemedText>
                {permission.canAskAgain ? (
                    <Pressable
                        style={[
                            styles.permissionButton,
                            { backgroundColor: colors.tint },
                        ]}
                        onPress={requestPermission}>
                        <ThemedText style={styles.permissionButtonText}>
                            Grant Access
                        </ThemedText>
                    </Pressable>
                ) : (
                    <Pressable
                        style={[
                            styles.permissionButton,
                            { backgroundColor: colors.tint },
                        ]}
                        onPress={() => Linking.openSettings()}>
                        <ThemedText style={styles.permissionButtonText}>
                            Open Settings
                        </ThemedText>
                    </Pressable>
                )}
                <Pressable
                    onPress={() => router.back()}
                    style={styles.permissionClose}>
                    <ThemedText style={{ color: colors.tint }}>
                        Go Back
                    </ThemedText>
                </Pressable>
            </View>
        );
    }

    const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
        const barcode = result.data;
        dismissOcrResults();
        setScanState({ kind: "searching", source: "barcode", query: barcode });

        try {
            const results = await searchByBarcode(barcode);
            if (results.length > 0) {
                setScanState({ kind: "found", source: "barcode", results });
            } else {
                setScanState({
                    kind: "not-found",
                    source: "barcode",
                    query: barcode,
                });
            }
        } catch {
            setScanState({
                kind: "not-found",
                source: "barcode",
                query: barcode,
            });
        }
    };

    const handleSelectResult = (result: AlbumSearchResult) => {
        router.push({
            pathname: "/vinyl/add",
            params: {
                albumName: result.albumName,
                artist: result.artist,
                year: result.year,
                genre: result.genre,
                coverImageUri: result.coverImageUri ?? "",
            },
        });
    };

    const handleTakePhoto = async () => {
        if (!cameraRef.current) return;
        const photo = await cameraRef.current.takePictureAsync({
            quality: 0.8,
        });
        if (photo) {
            router.push({
                pathname: "/vinyl/add",
                params: { coverImageUri: photo.uri },
            });
        }
    };

    const handleAddManually = () => {
        router.replace("/vinyl/add");
    };

    const handleScanAgain = () => {
        dismissOcrResults();
        setScanState({ kind: "idle" });
    };

    const isScanning = scanState.kind === "idle" && !showOcrResults;

    const ocrStatusLabel =
        ocrStatus === "capturing"
            ? "Scanning cover..."
            : ocrStatus === "recognizing"
              ? "Reading text..."
              : ocrStatus === "searching"
                ? "Searching Discogs..."
                : null;

    return (
        <View style={styles.container}>
            <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing='back'
                enableTorch={enableTorch}
                onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
                barcodeScannerSettings={{
                    barcodeTypes: ["upc_a", "ean13", "ean8", "upc_e"],
                }}
            />

            {/* Top bar */}
            <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
                <View style={styles.topBarLeft}>
                    <Pressable
                        onPress={() => setEnableTorch(!enableTorch)}
                        style={styles.topButton}
                        hitSlop={12}>
                        <IconSymbol
                            name={enableTorch ? "bolt.fill" : "bolt.slash.fill"}
                            size={22}
                            color='#fff'
                        />
                    </Pressable>
                    <Pressable
                        onPress={() => setOcrEnabled(!ocrEnabled)}
                        style={[
                            styles.topButton,
                            !ocrEnabled && styles.topButtonDisabled,
                        ]}
                        hitSlop={12}>
                        <IconSymbol
                            name={ocrEnabled ? "eye" : "eye.slash"}
                            size={22}
                            color='#fff'
                        />
                    </Pressable>
                </View>
                <Pressable
                    onPress={() => router.back()}
                    style={styles.topButton}
                    hitSlop={12}>
                    <IconSymbol name='xmark' size={22} color='#fff' />
                </Pressable>
            </View>

            {/* Viewfinder hint (idle, no OCR results showing) */}
            {scanState.kind === "idle" && !showOcrResults && (
                <View style={styles.viewfinder}>
                    <View style={styles.viewfinderBox}>
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />
                    </View>
                    <ThemedText style={styles.scanHint}>
                        Point at a barcode or album cover
                    </ThemedText>
                </View>
            )}

            {/* OCR status pill (above shutter when actively processing) */}
            {scanState.kind === "idle" && !showOcrResults && ocrStatusLabel && (
                <View style={[styles.ocrPill, { bottom: insets.bottom + 120 }]}>
                    <ActivityIndicator size='small' color='#fff' />
                    <ThemedText style={styles.ocrPillText}>
                        {ocrStatusLabel}
                    </ThemedText>
                </View>
            )}

            {/* Searching overlay (barcode) */}
            {scanState.kind === "searching" && (
                <View
                    style={[
                        styles.overlay,
                        { backgroundColor: colors.card + "F0" },
                    ]}>
                    <ActivityIndicator size='large' color={colors.tint} />
                    <ThemedText style={styles.overlayText}>
                        Looking up barcode {scanState.query}...
                    </ThemedText>
                </View>
            )}

            {/* Found overlay (barcode) */}
            {scanState.kind === "found" && (
                <View
                    style={[
                        styles.overlay,
                        { backgroundColor: colors.card + "F0" },
                    ]}>
                    <ThemedText style={styles.overlayTitle}>
                        Found on Discogs
                    </ThemedText>
                    {scanState.results.slice(0, 3).map((result) => (
                        <Pressable
                            key={result.discogsId}
                            style={({ pressed }) => [
                                styles.resultRow,
                                { borderBottomColor: colors.icon + "20" },
                                pressed && { opacity: 0.6 },
                            ]}
                            onPress={() => handleSelectResult(result)}>
                            {result.coverImageUri ? (
                                <Image
                                    source={{ uri: result.coverImageUri }}
                                    style={styles.resultThumb}
                                    contentFit='cover'
                                />
                            ) : (
                                <View
                                    style={[
                                        styles.resultThumb,
                                        { backgroundColor: colors.icon + "20" },
                                    ]}>
                                    <IconSymbol
                                        name='music.note.list'
                                        size={24}
                                        color={colors.icon}
                                    />
                                </View>
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
                            <IconSymbol
                                name='chevron.right'
                                size={18}
                                color={colors.icon}
                            />
                        </Pressable>
                    ))}
                    <Pressable
                        onPress={handleScanAgain}
                        style={styles.overlayAction}>
                        <ThemedText style={{ color: colors.tint }}>
                            Scan Again
                        </ThemedText>
                    </Pressable>
                </View>
            )}

            {/* OCR results overlay */}
            {showOcrResults && (
                <View
                    style={[
                        styles.overlay,
                        { backgroundColor: colors.card + "F0" },
                    ]}>
                    <ThemedText style={styles.overlayTitle}>
                        Recognized from cover
                    </ThemedText>
                    {ocrQuery && (
                        <ThemedText
                            style={styles.overlayText}
                            numberOfLines={1}>
                            Searched: &ldquo;{ocrQuery}&rdquo;
                        </ThemedText>
                    )}
                    {ocrResults.map((result) => (
                        <Pressable
                            key={result.discogsId}
                            style={({ pressed }) => [
                                styles.resultRow,
                                { borderBottomColor: colors.icon + "20" },
                                pressed && { opacity: 0.6 },
                            ]}
                            onPress={() => handleSelectResult(result)}>
                            <View
                                style={[
                                    styles.resultThumb,
                                    styles.resultThumbPlaceholder,
                                    { backgroundColor: colors.icon + "20" },
                                ]}>
                                <IconSymbol
                                    name='music.note.list'
                                    size={24}
                                    color={colors.icon}
                                />
                            </View>
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
                            <IconSymbol
                                name='chevron.right'
                                size={18}
                                color={colors.icon}
                            />
                        </Pressable>
                    ))}
                    <Pressable
                        onPress={dismissOcrResults}
                        style={styles.overlayAction}>
                        <ThemedText style={{ color: colors.tint }}>
                            Dismiss
                        </ThemedText>
                    </Pressable>
                </View>
            )}

            {/* Not found overlay */}
            {scanState.kind === "not-found" && (
                <View
                    style={[
                        styles.overlay,
                        { backgroundColor: colors.card + "F0" },
                    ]}>
                    <ThemedText style={styles.overlayTitle}>
                        No vinyl found
                    </ThemedText>
                    <ThemedText style={styles.overlayText}>
                        Barcode {scanState.query} not found on Discogs
                    </ThemedText>
                    <View style={styles.overlayButtons}>
                        <Pressable
                            style={[
                                styles.overlayButton,
                                { backgroundColor: colors.tint },
                            ]}
                            onPress={handleScanAgain}>
                            <ThemedText style={styles.overlayButtonText}>
                                Scan Again
                            </ThemedText>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.overlayButton,
                                { backgroundColor: colors.accent },
                            ]}
                            onPress={handleAddManually}>
                            <ThemedText style={styles.overlayButtonText}>
                                Add Manually
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
            )}

            {/* Shutter button (visible in idle state, no overlays) */}
            {scanState.kind === "idle" && !showOcrResults && (
                <View
                    style={[
                        styles.shutterContainer,
                        { paddingBottom: insets.bottom + 24 },
                    ]}>
                    <Pressable
                        style={styles.shutterButton}
                        onPress={handleTakePhoto}>
                        <View style={styles.shutterInner}>
                            <IconSymbol name='camera' size={28} color='#fff' />
                        </View>
                    </Pressable>
                    <ThemedText style={styles.shutterLabel}>
                        Take cover photo
                    </ThemedText>
                </View>
            )}
        </View>
    );
}

const CORNER_SIZE = 24;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    permissionContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        gap: 12,
    },
    permissionTitle: {
        marginTop: 16,
        textAlign: "center",
    },
    permissionText: {
        textAlign: "center",
        opacity: 0.6,
        lineHeight: 22,
        marginBottom: 8,
    },
    permissionButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    permissionButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    permissionClose: {
        marginTop: 16,
    },
    topBar: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        zIndex: 10,
    },
    topBarLeft: {
        flexDirection: "row",
        gap: 12,
    },
    topButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.4)",
        alignItems: "center",
        justifyContent: "center",
    },
    topButtonDisabled: {
        opacity: 0.5,
    },
    viewfinder: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
    },
    viewfinderBox: {
        width: 260,
        height: 160,
        position: "relative",
    },
    corner: {
        position: "absolute",
        width: CORNER_SIZE,
        height: CORNER_SIZE,
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderTopWidth: CORNER_WIDTH,
        borderLeftWidth: CORNER_WIDTH,
        borderColor: "#fff",
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderTopWidth: CORNER_WIDTH,
        borderRightWidth: CORNER_WIDTH,
        borderColor: "#fff",
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: CORNER_WIDTH,
        borderLeftWidth: CORNER_WIDTH,
        borderColor: "#fff",
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: CORNER_WIDTH,
        borderRightWidth: CORNER_WIDTH,
        borderColor: "#fff",
    },
    scanHint: {
        color: "#fff",
        fontSize: 15,
        marginTop: 24,
        textShadowColor: "rgba(0,0,0,0.6)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    ocrPill: {
        position: "absolute",
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    ocrPillText: {
        color: "#fff",
        fontSize: 13,
    },
    overlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        gap: 12,
        alignItems: "center",
    },
    overlayTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    overlayText: {
        opacity: 0.6,
        fontSize: 14,
        textAlign: "center",
    },
    overlayAction: {
        paddingVertical: 8,
    },
    overlayButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 4,
    },
    overlayButton: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 12,
    },
    overlayButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },
    resultRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        gap: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        alignSelf: "stretch",
    },
    resultThumb: {
        width: 50,
        height: 50,
        borderRadius: 6,
    },
    resultThumbPlaceholder: {
        alignItems: "center",
        justifyContent: "center",
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
    shutterContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        gap: 8,
    },
    shutterButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 4,
        borderColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    shutterInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    shutterLabel: {
        color: "#fff",
        fontSize: 13,
        opacity: 0.8,
    },
});
