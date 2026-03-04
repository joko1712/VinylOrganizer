import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<
    SymbolViewProps["name"],
    ComponentProps<typeof MaterialIcons>["name"]
>;
type IconSymbolName = keyof typeof MAPPING;
const MAPPING = {
    "house.fill": "home",
    "paperplane.fill": "send",
    "chevron.left.forwardslash.chevron.right": "code",
    "chevron.right": "chevron-right",
    "music.note.list": "library-music",
    "square.grid.2x2": "grid-view",
    "gearshape.fill": "settings",
    plus: "add",
    magnifyingglass: "search",
    xmark: "close",
    "xmark.circle.fill": "cancel",
    trash: "delete",
    pencil: "edit",
    photo: "photo",
    camera: "camera-alt",
    "barcode.viewfinder": "qr-code-scanner",
    "bolt.fill": "flash-on",
    "bolt.slash.fill": "flash-off",
    eye: "visibility",
    "eye.slash": "visibility-off",
} as IconMapping;

export function IconSymbol({
    name,
    size = 24,
    color,
    style,
}: {
    name: IconSymbolName;
    size?: number;
    color: string | OpaqueColorValue;
    style?: StyleProp<TextStyle>;
    weight?: SymbolWeight;
}) {
    return (
        <MaterialIcons
            color={color}
            size={size}
            name={MAPPING[name]}
            style={style}
        />
    );
}
