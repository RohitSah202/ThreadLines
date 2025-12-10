export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: number;
}

export interface Snippet {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  color?: string;
  folderId: string | null;
  pinned: boolean;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  color?: string;
  createdAt: number;
}

export type SortOption = 'newest' | 'oldest' | 'az' | 'za';
export type ViewMode = 'grid' | 'list';

export enum AppRoute {
  HOME = '/',
  AUTH = '/auth',
  ACCOUNT = '/account',
  SNIPPET = '/snippet/:id',
  FOLDER = '/folder/:id',
}

export const CATEGORIES = [
  'General',
  'Ideas',
  'Study',
  'Work',
  'Recipes',
  'Quotes',
  'To-Do',
  'Personal',
  'Journal',
  'Code',
  'Finance'
];

export const COLORS = [
  'bg-white',
  'bg-red-50',
  'bg-orange-50',
  'bg-amber-50',
  'bg-green-50',
  'bg-emerald-50',
  'bg-teal-50',
  'bg-cyan-50',
  'bg-sky-50',
  'bg-blue-50',
  'bg-indigo-50',
  'bg-violet-50',
  'bg-purple-50',
  'bg-fuchsia-50',
  'bg-pink-50',
  'bg-rose-50',
  'bg-stone-50',
];