export interface SavedItem {
  id: string;
  objectName: string;
  location: string;
  note?: string;
  photoUri?: string;
  createdAt: string;
  updatedAt: string;
}

export type SavedItemDraft = Pick<SavedItem, 'objectName' | 'location'> &
  Partial<Pick<SavedItem, 'note' | 'photoUri'>>;
