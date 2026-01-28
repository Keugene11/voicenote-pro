'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Note, getNotes } from '@/lib/api';

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  error: string | null;
  setNotes: (notes: Note[]) => void;
  refreshNotes: (token: string) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
}

const NotesContext = createContext<NotesContextType | null>(null);

const CACHE_KEY = 'rabona_notes_cache';

function getCachedNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

function setCachedNotes(notes: Note[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(notes));
  } catch {
    // Ignore storage errors
  }
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotesState] = useState<Note[]>(() => getCachedNotes());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastToken, setLastToken] = useState<string | null>(null);

  const setNotes = useCallback((newNotes: Note[]) => {
    setNotesState(newNotes);
    setCachedNotes(newNotes);
  }, []);

  const refreshNotes = useCallback(async (token: string) => {
    if (!token) return;

    // Only show loading if we have no notes at all
    if (notes.length === 0) {
      setLoading(true);
    }

    try {
      const fetchedNotes = await getNotes(token);
      setNotes(fetchedNotes);
      setError(null);
      setLastToken(token);
    } catch (err) {
      if (notes.length === 0) {
        setError('Failed to load notes');
      }
    } finally {
      setLoading(false);
    }
  }, [notes.length, setNotes]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotesState(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, ...updates } : n);
      setCachedNotes(updated);
      return updated;
    });
  }, []);

  const deleteNoteFromState = useCallback((id: string) => {
    setNotesState(prev => {
      const updated = prev.filter(n => n.id !== id);
      setCachedNotes(updated);
      return updated;
    });
  }, []);

  return (
    <NotesContext.Provider value={{
      notes,
      loading,
      error,
      setNotes,
      refreshNotes,
      updateNote,
      deleteNote: deleteNoteFromState,
    }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
