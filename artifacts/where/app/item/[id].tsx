import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useItems } from '@/contexts/ItemsContext';
import { formatFullDate } from '@/lib/item-utils';

export default function ItemDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, isLoading, deleteItem } = useItems();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isDeleting, setIsDeleting] = useState(false);
  const item = items.find((saved) => saved.id === id);
  const topInset =
    Platform.OS === 'web' ? Math.max(67, insets.top) : insets.top + 10;
  const bottomInset =
    Platform.OS === 'web' ? Math.max(34, insets.bottom) : insets.bottom + 20;

  const confirmDelete = () => {
    if (!item || isDeleting) return;
    Alert.alert(
      'Delete this item?',
      `“${item.objectName}” and its saved details will be removed from this device.`,
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setIsDeleting(true);
              try {
                await deleteItem(item.id);
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.replace('/');
              } catch {
                Alert.alert('Could not delete', 'Please try again.');
                setIsDeleting(false);
              }
            })();
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
        <Text style={[styles.missing, { color: colors.foreground }]}>
          This saved item could not be found.
        </Text>
        <Pressable onPress={() => router.replace('/')} style={styles.backLink}>
          <Text style={[styles.backLinkText, { color: colors.primary }]}>Go home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset, paddingBottom: bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            testID="item-back"
          >
            <Feather name="arrow-left" size={21} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.wordmark, { color: colors.primary }]}>REMEMBERED</Text>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit item"
              onPress={() =>
                router.push({ pathname: '/capture', params: { mode: 'edit', id: item.id } })
              }
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              testID="edit-item"
            >
              <Feather name="edit-2" size={18} color={colors.foreground} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete item"
              onPress={confirmDelete}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              testID="delete-item"
            >
              {isDeleting ? (
                <ActivityIndicator color={colors.destructive} size="small" />
              ) : (
                <Feather name="trash-2" size={18} color={colors.destructive} />
              )}
            </Pressable>
          </View>
        </View>

        {item.photoUri ? (
          <Image
            source={{ uri: item.photoUri }}
            style={[styles.photo, { backgroundColor: colors.secondary }]}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.secondary }]}>
            <Feather name="archive" size={27} color={colors.primary} />
          </View>
        )}

        <View style={styles.itemIntro}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>ITEM</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>{item.objectName}</Text>
        </View>

        <View style={[styles.locationCard, { backgroundColor: colors.primary }]}>
          <View style={styles.locationHeading}>
          <View style={[styles.pinCircle, { backgroundColor: colors.primaryForeground }]}>
            <Feather name="map-pin" size={17} color={colors.primary} />
            </View>
            <Text style={[styles.locationLabel, { color: colors.primaryForeground, opacity: 0.78 }]}>
              LAST LEFT AT
            </Text>
          </View>
          <Text style={[styles.location, { color: colors.primaryForeground }]}>
            {item.location}
          </Text>
          <Text style={[styles.savedDate, { color: colors.primaryForeground, opacity: 0.78 }]}>
            {formatFullDate(item.updatedAt)}
          </Text>
        </View>

        {item.note ? (
          <View style={[styles.noteCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.noteLabel, { color: colors.mutedForeground }]}>NOTE</Text>
            <Text style={[styles.note, { color: colors.foreground }]}>{item.note}</Text>
          </View>
        ) : null}

        <Text style={[styles.privacyNote, { color: colors.mutedForeground }]}>
          Saved on this device
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 22 },
  header: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.55 },
  wordmark: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5 },
  headerActions: { flexDirection: 'row', marginRight: -8 },
  photo: { width: '100%', height: 240, borderRadius: 22, marginTop: 23 },
  imagePlaceholder: { width: '100%', height: 178, borderRadius: 22, marginTop: 23, alignItems: 'center', justifyContent: 'center' },
  itemIntro: { marginTop: 25 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.5 },
  title: { marginTop: 5, fontFamily: 'Inter_700Bold', fontSize: 31, lineHeight: 38, letterSpacing: -1 },
  locationCard: { marginTop: 20, padding: 19, borderRadius: 20 },
  locationHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  pinCircle: { width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  locationLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.4 },
  location: { marginTop: 13, fontFamily: 'Inter_600SemiBold', fontSize: 19, lineHeight: 26 },
  savedDate: { marginTop: 9, fontFamily: 'Inter_400Regular', fontSize: 12 },
  noteCard: { marginTop: 12, borderWidth: 1, borderRadius: 18, padding: 17 },
  noteLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.3 },
  note: { marginTop: 7, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
  privacyNote: { marginTop: 22, fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center' },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  missing: { fontFamily: 'Inter_500Medium', fontSize: 15, textAlign: 'center' },
  backLink: { padding: 14 },
  backLinkText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
