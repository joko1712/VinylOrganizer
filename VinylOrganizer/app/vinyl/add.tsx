import { useLocalSearchParams, useRouter } from "expo-router";

import { ThemedView } from "@/components/themed-view";
import { VinylForm } from "@/components/vinyl/vinyl-form";
import { useVinyls } from "@/context/vinyl-context";

export default function AddVinylScreen() {
    const { addVinyl } = useVinyls();
    const router = useRouter();
    const params = useLocalSearchParams<{
        albumName?: string;
        artist?: string;
        year?: string;
        genre?: string;
        coverImageUri?: string;
    }>();

    const fromScan = Boolean(params.albumName || params.coverImageUri);

    const initialData = fromScan
        ? {
              albumName: params.albumName ?? "",
              artist: params.artist ?? "",
              year: params.year ? parseInt(params.year, 10) : null,
              genre: params.genre ?? "",
              coverImageUri: params.coverImageUri || null,
              notes: "",
          }
        : undefined;

    return (
        <ThemedView style={{ flex: 1 }}>
            <VinylForm
                initialData={initialData}
                submitLabel='Add to Collection'
                onSubmit={async (data) => {
                    await addVinyl(data);
                    if (fromScan) {
                        router.dismissAll();
                    } else {
                        router.back();
                    }
                }}
            />
        </ThemedView>
    );
}
