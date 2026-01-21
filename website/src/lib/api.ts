const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Note {
  id: string;
  originalText: string;
  processedText: string;
  tone: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface TranscribeResponse {
  success: boolean;
  data?: {
    originalText: string;
    processedText: string;
    tone: string;
    duration: number;
  };
  error?: string;
}

export async function transcribeAudio(
  audioBlob: Blob,
  token: string,
  tone: string = 'professional'
): Promise<TranscribeResponse> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('tone', tone);

  const response = await fetch(`${API_URL}/api/transcribe`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
}

export async function getNotes(token: string): Promise<Note[]> {
  const response = await fetch(`${API_URL}/api/notes`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data.notes || [];
}

export async function deleteNote(noteId: string, token: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.ok;
}

export async function rephraseNote(
  noteId: string,
  tone: string,
  token: string
): Promise<{ processedText: string }> {
  const response = await fetch(`${API_URL}/api/notes/${noteId}/rephrase`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tone }),
  });

  return response.json();
}
