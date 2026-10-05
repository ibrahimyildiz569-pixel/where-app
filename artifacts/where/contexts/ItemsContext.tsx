import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { SavedItem, SavedItemDraft } from '@/types/item';

const STORAGE_KEY = '@where/saved-items/v1';

interface ItemsContextValue {
  items: SavedItem[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addItem: (draft: SavedItemDraft) => Promise<SavedItem>;
  updateItem: (id: string, draft: SavedItemDraft) => Promise<SavedItem>;
  deleteItem: (id: string) => Promise<void>;
}

const ItemsContext = createContext<ItemsContextValue | null>(null);

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsRef = useRef<SavedItem[]>([]);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(parsed)) {
        throw new Error('Saved items are not in the expected format.');
      }
      const next = parsed as SavedItem[];
      itemsRef.current = next;
      setItems(next);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Your saved items could not be loaded.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const persist = useCallback(async (next: SavedItem[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    itemsRef.current = next;
    setItems(next);
    setError(null);
  }, []);

  const addItem = useCallback(
    async (draft: SavedItemDraft) => {
      const now = new Date().toISOString();
      const item: SavedItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        objectName: draft.objectName.trim(),
        location: draft.location.trim(),
        note: draft.note?.trim() || undefined,
        photoUri: draft.photoUri || undefined,
        createdAt: now,
        updatedAt: now,
      };
      await persist([item, ...itemsRef.current]);
      return item;
    },
    [persist],
  );

  const updateItem = useCallback(
    async (id: string, draft: SavedItemDraft) => {
      const current = itemsRef.current.find((item) => item.id === id);
      if (!current) throw new Error('This saved item no longer exists.');

      const updated: SavedItem = {
        ...current,
        objectName: draft.objectName.trim(),
        location: draft.location.trim(),
        note: draft.note?.trim() || undefined,
        photoUri: draft.photoUri || undefined,
        updatedAt: new Date().toISOString(),
      };
      await persist([
        updated,
        ...itemsRef.current.filter((item) => item.id !== id),
      ]);
      return updated;
    },
    [persist],
  );

  const deleteItem = useCallback(
    async (id: string) => {
      if (!itemsRef.current.some((item) => item.id === id)) return;
      await persist(itemsRef.current.filter((item) => item.id !== id));
    },
    [persist],
  );

  const value = useMemo(
    () => ({ items, isLoading, error, reload, addItem, updateItem, deleteItem }),
    [items, isLoading, error, reload, addItem, updateItem, deleteItem],
  );

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
}

export function useItems(): ItemsContextValue {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used inside ItemsProvider.');
  }
  return context;
}
