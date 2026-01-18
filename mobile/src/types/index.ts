// User types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  subscriptionTier: 'free' | 'premium';
  subscriptionExpiresAt?: Date;
  monthlyUsage: number;
  createdAt: Date;
}

// Note types
export interface Note {
  id: string;
  userId: string;
  title?: string;
  audioUrl?: string;
  audioLocalPath?: string;
  originalText: string;
  rephrasedText?: string;
  tone: ToneType;
  durationSeconds: number;
  folder?: string;
  tags: string[];
  isStarred: boolean;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'error';
}

// Tone options for rephrasing
export type ToneType =
  | 'professional'
  | 'casual'
  | 'concise'
  | 'email'
  | 'meeting_notes'
  | 'original';

export const toneLabels: Record<ToneType, string> = {
  professional: 'Professional',
  casual: 'Casual',
  concise: 'Concise',
  email: 'Email',
  meeting_notes: 'Meeting Notes',
  original: 'Original',
};

// Recording state
export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioUri?: string;
  metering?: number[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TranscriptionResponse {
  text: string;
  language: string;
  duration: number;
}

export interface RephrasingResponse {
  originalText: string;
  rephrasedText: string;
  tone: ToneType;
}

// Auth types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  NoteDetail: { noteId: string };
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Record: undefined;
  Notes: undefined;
};
