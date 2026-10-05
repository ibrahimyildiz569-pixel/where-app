import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ItemRow } from '@/components/ItemRow';
import { useColors } from '@/hooks/useColors';
import { useItems } from '@/contexts/ItemsContext';
import type { SavedItem } from '@/types/item';

function PrimaryAction({
  title,
  subtitle,
  icon,
  tone,
  onPress,
  busy,
  testID,
}: {
  title: 'TELL' | 'SNAP' | 'FIND';
  subtitle: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  tone: 'dark' | 'sage' | 'coral';
  onPress: () => void;
  busy?: boolean;
  testID: string;
}) {
  const colors = useColors();
  const backgroundColor =
    tone === 'dark'
      ? colors.primary
      : tone === 'sage'
        ? colors.secondary
        : colors.accent;
  const foregroundColor =
    tone === 'dark' ? colors.primaryForeground : colors.foreground;
  const iconColor = tone === 'coral' ? colors.accentForeground : foregroundColor;
  const secondaryColor = tone === 'dark' ? colors.primaryForeground : colors.mutedForeground;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.action,
        { backgroundColor },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.actionIcon,
          {
            backgroundColor:
              tone === 'dark' ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.7)',
          },
        ]}
      >
        {busy ? (
          <ActivityIndicator color={iconColor} />
        ) : (
          <Feather name={icon} size={21} color={iconColor} />
        )}
      </View>
      <View style={styles.actionCopy}>
        <Text style={[styles.actionTitle, { color: foregroundColor }]}>
          {title}
        </Text>
        <Text
          style={[
            styles.actionSubtitle,
            { color: secondaryColor, opacity: tone === 'dark' ? 0.78 : 1 },
          ]}
        >
          {subtitle}
        </Text>
      </View>
      <Feather name="arrow-up-right" size={19} color={iconColor} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, isLoading, error, reload } = useItems();
  const [isCapturing, setIsCapturing] = useState(false);
  const topInset = Platform.OS === 'web' ? Math.max(67, insets.top) : insets.top;
  const bottomInset = Platform.OS === 'web' ? Math.max(34, insets.bottom) : insets.bottom;
  const recentItems = [...items]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 5);

  const openTell = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/capture', params: { mode: 'tell' } });
  };

  const openFind = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/find');
  };

  const openSnap = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      let result: ImagePicker.ImagePickerResult;
      if (Platform.OS === 'web') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.75,
        });
      } else {
        let permission = await ImagePicker.getCameraPermissionsAsync();
        if (!permission.granted) {
          permission = await ImagePicker.requestCameraPermissionsAsync();
        }

        if (!permission.granted) {
          if (!permission.canAskAgain) {
            Alert.alert(
              'Camera access is off',
              'Allow camera access in Settings to save a photo.',
              [
                { text: 'Not now', style: 'cancel' },
                { text: 'Open Settings', onPress: () => void Linking.openSettings() },
              ],
            );
          } else {
            Alert.alert('Camera needed', 'Allow camera access to take a photo.');
          }
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.75,
        });
      }

      if (!result.canceled && result.assets[0]?.uri) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push({
          pathname: '/capture',
          params: { mode: 'snap', photoUri: result.assets[0].uri },
        });
      }
    } catch {
      Alert.alert('Could not open the camera', 'Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const openItem = (item: SavedItem) => {
    router.push({ pathname: '/item/[id]', params: { id: item.id } });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + 12, paddingBottom: bottomInset + 26 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
    <View style={[styles.brandMark, { backgroundColor: colors.primary }]}>
            <Ionicons name="location" size={16} color={colors.accent} />
          </View>
          <Text style={[styles.wordmark, { color: colors.primary }]}>WHERE</Text>
          <Text style={[styles.brandCaption, { color: colors.mutedForeground }]}>
            YOUR THINGS, REMEMBERED
          </Text>
        </View>

        <View style={styles.intro}>
          <Text style={[styles.headline, { color: colors.foreground }]}>
            Know where
            {'\n'}it is.
          </Text>
          <Text style={[styles.introCopy, { color: colors.mutedForeground }]}>
            A little memory for the things you put away.
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryAction
            title="TELL"
            subtitle="Save it in a sentence"
            icon="message-circle"
            tone="dark"
            onPress={() => void openTell()}
            testID="tell-action"
          />
          <PrimaryAction
            title="SNAP"
            subtitle="Take a photo and add a place"
            icon="camera"
            tone="sage"
            onPress={() => void openSnap()}
            busy={isCapturing}
            testID="snap-action"
          />
          <PrimaryAction
            title="FIND"
            subtitle="Look up a saved item"
            icon="search"
            tone="coral"
            onPress={() => void openFind()}
            testID="find-action"
          />
        </View>

        <View style={styles.recentHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Recent items
            </Text>
            <Text style={[styles.sectionCaption, { color: colors.mutedForeground }]}>
              {items.length === 1 ? '1 thing remembered' : `${items.length} things remembered`}
            </Text>
          </View>
          <Feather name="clock" size={18} color={colors.mutedForeground} />
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <View style={[styles.messageBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Couldn’t load your saved items
            </Text>
            <Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>
              {error}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void reload()}
              style={[styles.retryButton, { backgroundColor: colors.secondary }]}
            >
              <Text style={[styles.retryText, { color: colors.primary }]}>Try again</Text>
            </Pressable>
          </View>
        ) : recentItems.length > 0 ? (
          <View style={styles.recentList}>
            {recentItems.map((item) => (
              <ItemRow key={item.id} item={item} onPress={() => openItem(item)} />
            ))}
          </View>
        ) : (
          <View style={[styles.messageBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="archive" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Nothing to remember yet
            </Text>
            <Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>
              Use TELL or SNAP to save where something belongs.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 22, gap: 0 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: { fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 2.3 },
  brandCaption: {
    marginLeft: 'auto',
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    letterSpacing: 1.25,
  },
  intro: { marginTop: 32, marginBottom: 24 },
  headline: { fontFamily: 'Inter_700Bold', fontSize: 39, lineHeight: 43, letterSpacing: -1.8 },
  introCopy: { marginTop: 10, fontFamily: 'Inter_400Regular', fontSize: 15 },
  actions: { gap: 10 },
  action: {
    minHeight: 76,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  actionCopy: { flex: 1, gap: 4 },
  actionTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 1.2 },
  actionSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  recentHeader: {
    marginTop: 34,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, letterSpacing: -0.3 },
  sectionCaption: { marginTop: 3, fontFamily: 'Inter_400Regular', fontSize: 12 },
  recentList: { gap: 9 },
  loadingBox: { minHeight: 100, alignItems: 'center', justifyContent: 'center' },
  messageBox: {
    minHeight: 148,
    borderWidth: 1,
    borderRadius: 20,
    padding: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, textAlign: 'center' },
  emptyCopy: { marginTop: 5, maxWidth: 250, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  retryButton: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, marginTop: 12 },
  retryText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});
