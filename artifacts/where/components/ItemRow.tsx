import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { formatRelativeDate } from '@/lib/item-utils';
import type { SavedItem } from '@/types/item';

export function ItemRow({
  item,
  onPress,
  testID,
}: {
  item: SavedItem;
  onPress: () => void;
  testID?: string;
}) {
  const colors = useColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.objectName}, ${item.location}`}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      {item.photoUri ? (
        <Image
          source={{ uri: item.photoUri }}
          style={[styles.thumbnail, { backgroundColor: colors.secondary }]}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
          <Feather name="box" size={19} color={colors.primary} />
        </View>
      )}
      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.name, { color: colors.foreground }]}>
          {item.objectName}
        </Text>
        <View style={styles.placeLine}>
          <Feather name="map-pin" size={13} color={colors.mutedForeground} />
          <Text
            numberOfLines={1}
            style={[styles.location, { color: colors.mutedForeground }]}
          >
            {item.location}
          </Text>
        </View>
      </View>
      <Text style={[styles.date, { color: colors.mutedForeground }]}>
        {formatRelativeDate(item.updatedAt)}
      </Text>
      <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    padding: 10,
    gap: 12,
  },
  pressed: { opacity: 0.72 },
  thumbnail: { width: 48, height: 48, borderRadius: 13 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 5 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  placeLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  location: { flexShrink: 1, fontFamily: 'Inter_400Regular', fontSize: 13 },
  date: { fontFamily: 'Inter_400Regular', fontSize: 11 },
});
