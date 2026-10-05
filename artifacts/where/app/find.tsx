import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ItemRow } from '@/components/ItemRow';
import { useColors } from '@/hooks/useColors';
import { useItems } from '@/contexts/ItemsContext';
import { getLatestMatches, getSearchTerms } from '@/lib/item-utils';
import type { SavedItem } from '@/types/item';

export default function FindScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, isLoading } = useItems();
  const [query, setQuery] = useState('');
  const topInset =
    Platform.OS === 'web' ? Math.max(67, insets.top) : insets.top + 12;
  const bottomInset =
    Platform.OS === 'web' ? Math.max(34, insets.bottom) : insets.bottom + 16;
  const matches = useMemo(() => getLatestMatches(items, query), [items, query]);
  const searchTerms = getSearchTerms(query);

  const openItem = (item: SavedItem) => {
    Keyboard.dismiss();
    router.push({ pathname: '/item/[id]', params: { id: item.id } });
  };

  return (
    <KeyboardAvoidingView style={[styles.screen, { backgroundColor: colors.background }]} behavior="padding">
      <ScrollView
        keyboardShouldPersistTaps="handled"
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
            testID="find-back"
          >
            <Feather name="arrow-left" size={21} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.wordmark, { color: colors.primary }]}>FIND</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={[styles.headline, { color: colors.foreground }]}>
          What are you
          {'\n'}looking for?
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Search your saved things. Ask a question, or just name it.
        </Text>

        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={19} color={colors.mutedForeground} />
          <TextInput
            accessibilityLabel="Search saved items"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder="Where is my passport?"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="search"
            style={[styles.searchInput, { color: colors.foreground }]}
            testID="find-search-input"
            value={query}
          />
          {query.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setQuery('')}
              hitSlop={10}
            >
              <Feather name="x-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
        <Text style={[styles.dictationHint, { color: colors.mutedForeground }]}>
          Tap the microphone on your keyboard to speak.
        </Text>

        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsTitle, { color: colors.foreground }]}>
            {searchTerms ? 'LATEST PLACES' : 'RECENTLY SAVED'}
          </Text>
          {!!searchTerms && (
            <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
              {matches.length} {matches.length === 1 ? 'match' : 'matches'}
            </Text>
          )}
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : matches.length > 0 ? (
          <View style={styles.list}>
            {matches.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onPress={() => openItem(item)}
                testID={`find-result-${item.id}`}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
              <Feather name={searchTerms ? 'search' : 'archive'} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {searchTerms ? 'No match just yet' : 'Nothing saved yet'}
            </Text>
            <Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>
              {searchTerms
                ? 'Try another name, place, or note.'
                : 'Save an item with TELL or SNAP and it will show up here.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 22, flexGrow: 1 },
  header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.55 },
  wordmark: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 2 },
  headerSpacer: { width: 40 },
  headline: { marginTop: 28, fontFamily: 'Inter_700Bold', fontSize: 34, lineHeight: 39, letterSpacing: -1.25 },
  subtitle: { marginTop: 9, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },
  searchBox: {
    height: 56,
    borderWidth: 1,
    borderRadius: 17,
    marginTop: 23,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  searchInput: { flex: 1, minWidth: 0, height: '100%', fontFamily: 'Inter_400Regular', fontSize: 15 },
  dictationHint: { marginTop: 9, marginLeft: 3, fontFamily: 'Inter_400Regular', fontSize: 11 },
  resultsHeader: { marginTop: 31, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultsTitle: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.4 },
  resultCount: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  list: { gap: 9 },
  loading: { padding: 40, alignItems: 'center' },
  emptyBox: { minHeight: 150, borderWidth: 1, borderRadius: 20, padding: 20, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, textAlign: 'center' },
  emptyCopy: { marginTop: 5, maxWidth: 250, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, textAlign: 'center' },
});
