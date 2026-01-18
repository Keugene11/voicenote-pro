import { create } from 'zustand';
import { ToneType } from '../types';

interface RecordingStore {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioUri: string | null;
  metering: number[];
  selectedTone: ToneType;
  selectedLanguage: string;

  // Processing state
  isTranscribing: boolean;
  isRephrasing: boolean;
  transcribedText: string | null;
  rephrasedText: string | null;
  error: string | null;

  // Actions
  startRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: (audioUri: string) => void;
  resetRecording: () => void;
  updateDuration: (duration: number) => void;
  addMeteringValue: (value: number) => void;
  setSelectedTone: (tone: ToneType) => void;
  setSelectedLanguage: (language: string) => void;

  // Processing actions
  setTranscribing: (isTranscribing: boolean) => void;
  setRephrasing: (isRephrasing: boolean) => void;
  setTranscribedText: (text: string | null) => void;
  setRephrasedText: (text: string | null) => void;
  setError: (error: string | null) => void;
}

export const useRecordingStore = create<RecordingStore>((set) => ({
  isRecording: false,
  isPaused: false,
  duration: 0,
  audioUri: null,
  metering: [],
  selectedTone: 'professional',
  selectedLanguage: 'en-US',

  isTranscribing: false,
  isRephrasing: false,
  transcribedText: null,
  rephrasedText: null,
  error: null,

  startRecording: () => set({
    isRecording: true,
    isPaused: false,
    duration: 0,
    metering: [],
    audioUri: null,
    transcribedText: null,
    rephrasedText: null,
    error: null,
  }),

  pauseRecording: () => set({ isPaused: true }),

  resumeRecording: () => set({ isPaused: false }),

  stopRecording: (audioUri) => set({
    isRecording: false,
    isPaused: false,
    audioUri,
  }),

  resetRecording: () => set({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioUri: null,
    metering: [],
    transcribedText: null,
    rephrasedText: null,
    error: null,
  }),

  updateDuration: (duration) => set({ duration }),

  addMeteringValue: (value) => set((state) => ({
    metering: [...state.metering.slice(-14), value], // Keep last 15 values for visualization
  })),

  setSelectedTone: (selectedTone) => set({ selectedTone }),

  setSelectedLanguage: (selectedLanguage) => set({ selectedLanguage }),

  setTranscribing: (isTranscribing) => set({ isTranscribing }),

  setRephrasing: (isRephrasing) => set({ isRephrasing }),

  setTranscribedText: (transcribedText) => set({ transcribedText }),

  setRephrasedText: (rephrasedText) => set({ rephrasedText }),

  setError: (error) => set({ error }),
}));
