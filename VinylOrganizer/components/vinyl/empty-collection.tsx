import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface EmptyCollectionProps {
    onAddPress: () => void;
    onScanPress: () => void;
}

export function EmptyCollection({ onAddPress, onScanPress }: EmptyCollectionProps) {
    const colorScheme = useColorScheme() ?? "light";

    return (
        <View style={styles.container}>
            <IconSymbol
                name='music.note.list'
                size={80}
                color={Colors[colorScheme].icon}
            />
            <ThemedText style={styles.title}>
                Your collection is Empty
            </ThemedText>
            <ThemedText style={styles.subtitle}>
                Start by adding your first vinyl record
            </ThemedText>
            <Pressable
                style={[
                    styles.button,
                    { backgroundColor: Colors[colorScheme].tint },
                ]}
                onPress={onAddPress}>
                <IconSymbol name='plus' size={20} color='#fff' />
                <ThemedText style={styles.buttonText}>
                    Add your first vinyl
                </ThemedText>
            </Pressable>
            <Pressable
                style={[
                    styles.button,
                    { backgroundColor: Colors[colorScheme].accent },
                ]}
                onPress={onScanPress}>
                <IconSymbol name='barcode.viewfinder' size={20} color='#fff' />
                <ThemedText style={styles.buttonText}>
                    Scan barcode
                </ThemedText>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        gap: 12,
    },
    title: {
        marginTop: 16,
        fontSize: 25,
        fontWeight: 900,
        textAlign: "center",
    },
    subtitle: {
        textAlign: "center",
        opacity: 0.6,
        marginBottom: 8,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
