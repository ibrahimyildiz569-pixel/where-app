import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useColors } from '@/hooks/useColors';
import { useItems } from '@/contexts/ItemsContext';
import { parseRememberStatement } from '@/lib/item-utils';
import type { SavedItem, SavedItemDraft } from '@/types/item';

function CaptureForm({
  mode,
  initialItem,
  incomingPhoto,
}: {
  mode: 'tell' | 'snap' | 'edit';
  initialItem: SavedItem | null;
  incomingPhoto?: string;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addItem, updateItem } = useItems();
  const [statement, setStatement] = useState('');
  const [objectName, setObjectName] = useState(initialItem?.objectName ?? '');
  const [location, setLocation] = useState(initialItem?.location ?? '');
  const [note, setNote] = useState(initialItem?.note ?? '');
  const [photoUri, setPhotoUri] = useState(initialItem?.photoUri ?? incomingPhoto ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const topInset = Platform.OS === 'web' ? Math.max(67, insets.top) : insets.top;
  const bottomInset = Platform.OS === 'web' ? Math.max(34, insets.bottom) : insets.bottom;
  const isEdit = mode === 'edit';

  const handleStatementChange = (value: string) => {
    setStatement(value);
    const parsed = parseRememberStatement(value);
    if (parsed) {
      setObjectName(parsed.objectName);
      setLocation(parsed.location);
    }
  };

  const addPhoto = async () => {
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
          Alert.alert('Camera access needed', 'Allow camera access to take a photo.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.75,
        });
      }
      if (!result.canceled && result.assets[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Could not add a photo', 'Please try again.');
    }
  };

  const save = async () => {
    Keyboard.dismiss();
    if (!objectName.trim() || !location.trim()) {
      Alert.alert('Add an item and a place', 'Both fields are needed to remember where it is.');
      return;
    }

    setIsSaving(true);
    const draft: SavedItemDraft = {
      objectName,
      location,
      note,
      photoUri: photoUri || undefined,
    };
    try {
      if (initialItem) {
        await updateItem(initialItem.id, draft);
      } else {
        await addItem(draft);
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/');
    } catch (cause) {
      Alert.alert(
        'Could not save',
        cause instanceof Error ? cause.message : 'Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const title = isEdit ? 'EDIT ITEM' : mode.toUpperCase();
  const subtitle =
    mode === 'tell'
      ? 'Say it in your own words. You can change the details before saving.'
      : mode === 'snap'
        ? 'Add a name and a place so you can find it later.'
        : 'Update where this belongs.';

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + 8, paddingBottom: bottomInset + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={80}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            testID="capture-back"
          >
            <Feather name="arrow-left" size={21} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.wordmark, { color: colors.primary }]}>{title}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={[styles.headline, { color: colors.foreground }]}>
          {mode === 'tell' ? 'Where did it go?' : mode === 'snap' ? 'Save this place.' : 'Make it right.'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>

        {mode === 'tell' && (
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Tell it like it happened</Text>
            <TextInput
              accessibilityLabel="Describe where you put the item"
              autoCapitalize="sentences"
              multiline
              onChangeText={handleStatementChange}
              placeholder="I put my passport in the second drawer of the bedroom cabinet."
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                styles.statementInput,
                { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border },
              ]}
              testID="tell-statement-input"
              textAlignVertical="top"
              value={statement}
            />
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              Tap the microphone on your keyboard to speak.
            </Text>
          </View>
        )}

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>What is it?</Text>
          <TextInput
            accessibilityLabel="Object name"
            autoCapitalize="sentences"
            onChangeText={setObjectName}
            placeholder="Passport"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="next"
            style={[
              styles.input,
              { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border },
            ]}
            testID="object-name-input"
            value={objectName}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Where is it?</Text>
          <TextInput
            accessibilityLabel="Item location"
            autoCapitalize="sentences"
            multiline
            onChangeText={setLocation}
            placeholder="Second drawer of the bedroom cabinet"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              styles.locationInput,
              { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border },
            ]}
            testID="item-location-input"
            textAlignVertical="top"
            value={location}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Note <Text style={[styles.optional, { color: colors.mutedForeground }]}>OPTIONAL</Text></Text>
          <TextInput
            accessibilityLabel="Optional note"
            autoCapitalize="sentences"
            multiline
            onChangeText={setNote}
            placeholder="Anything else worth remembering?"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              styles.noteInput,
              { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border },
            ]}
            testID="item-note-input"
            textAlignVertical="top"
            value={note}
          />
        </View>

        {photoUri ? (
          <View style={styles.photoSection}>
            <Image
              source={{ uri: photoUri }}
              style={[styles.photo, { backgroundColor: colors.secondary }]}
              contentFit="cover"
            />
            <View style={styles.photoActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => void addPhoto()}
                style={({ pressed }) => [styles.photoAction, pressed && styles.pressed]}
              >
                <Feather name="camera" size={15} color={colors.primary} />
                <Text style={[styles.photoActionText, { color: colors.primary }]}>Retake</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPhotoUri('')}
                style={({ pressed }) => [styles.photoAction, pressed && styles.pressed]}
              >
                <Feather name="trash-2" size={15} color={colors.destructive} />
                <Text style={[styles.photoActionText, { color: colors.destructive }]}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => void addPhoto()}
            style={({ pressed }) => [
              styles.addPhoto,
              { backgroundColor: colors.secondary, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
            testID="add-photo"
          >
            <Feather name="camera" size={18} color={colors.primary} />
            <Text style={[styles.addPhotoText, { color: colors.primary }]}>Add a photo</Text>
            <Text style={[styles.optional, { color: colors.mutedForeground }]}>OPTIONAL</Text>
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={() => void save()}
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: colors.primary },
            (pressed || isSaving) && styles.pressed,
          ]}
          testID="save-item"
        >
          {isSaving ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <>
              <Text style={[styles.saveText, { color: colors.primaryForeground }]}>
                {isEdit ? 'Save changes' : 'Save to WHERE'}
              </Text>
              <Feather name="arrow-right" size={18} color={colors.primaryForeground} />
            </>
          )}
        </Pressable>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

export default function CaptureScreen() {
  const { items, isLoading } = useItems();
  const params = useLocalSearchParams<{ mode?: string; id?: string; photoUri?: string }>();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const requestedMode = params.mode;
  const mode: 'tell' | 'snap' | 'edit' =
    id ? 'edit' : requestedMode === 'snap' ? 'snap' : 'tell';
  const initialItem = id ? items.find((item) => item.id === id) : null;
  const colors = useColors();

  if (id && isLoading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (id && !initialItem) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
        <Text style={[styles.missingItem, { color: colors.foreground }]}>
          This saved item could not be found.
        </Text>
        <Pressable onPress={() => router.back()} style={styles.goBack}>
          <Text style={[styles.goBackText, { color: colors.primary }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <CaptureForm
      key={id ?? `new-${mode}`}
      mode={mode}
      initialItem={initialItem ?? null}
      incomingPhoto={typeof params.photoUri === 'string' ? params.photoUri : undefined}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 22 },
  header: { height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.68 },
  wordmark: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 1.8 },
  headerSpacer: { width: 40 },
  headline: { marginTop: 27, fontFamily: 'Inter_700Bold', fontSize: 32, lineHeight: 38, letterSpacing: -1.1 },
  subtitle: { marginTop: 7, marginBottom: 24, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },
  fieldGroup: { marginBottom: 18 },
  label: { marginBottom: 8, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  optional: { fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 1.1 },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  statementInput: { minHeight: 96, lineHeight: 21 },
  locationInput: { minHeight: 78, lineHeight: 20 },
  noteInput: { minHeight: 72, lineHeight: 20 },
  hint: { marginTop: 7, marginLeft: 2, fontFamily: 'Inter_400Regular', fontSize: 11 },
  addPhoto: {
    minHeight: 52,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 15,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 20,
  },
  addPhotoText: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  photoSection: { marginBottom: 20 },
  photo: { width: '100%', height: 190, borderRadius: 18 },
  photoActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 17, paddingTop: 9 },
  photoAction: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 6 },
  photoActionText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  saveButton: { minHeight: 56, borderRadius: 17, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  saveText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 26 },
  missingItem: { fontFamily: 'Inter_500Medium', fontSize: 16, textAlign: 'center' },
  goBack: { marginTop: 15, padding: 12 },
  goBackText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
