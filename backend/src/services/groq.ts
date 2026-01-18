import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

console.log('Groq API key configured:', !!GROQ_API_KEY);

export type ToneType =
  | 'professional'
  | 'casual'
  | 'concise'
  | 'email'
  | 'meeting_notes'
  | 'original';

const tonePrompts: Record<ToneType, string> = {
  professional: `Rewrite the following text to sound more professional and polished.
    Maintain the original meaning but improve clarity, remove filler words, and use appropriate business language.
    Keep the same general length unless brevity significantly improves the message.`,

  casual: `Rewrite the following text in a friendly, conversational tone.
    Keep it natural and easy to read while maintaining the core message.
    Feel free to use contractions and casual phrasing.`,

  concise: `Summarize and condense the following text to its essential points.
    Remove all unnecessary words and filler. Make it as brief as possible while retaining the key information.
    Use bullet points if it improves clarity.`,

  email: `Transform the following text into a well-structured email format.
    Include an appropriate greeting and sign-off.
    Organize the content clearly with proper paragraphs.
    Maintain a professional yet approachable tone.`,

  meeting_notes: `Convert the following text into organized meeting notes.
    Structure it with:
    - Key discussion points
    - Action items (if any)
    - Decisions made (if any)
    Use bullet points and clear headings for easy scanning.`,

  original: `Return the text exactly as provided, only fixing obvious grammatical errors and typos.`,
};

export interface TranscriptionResult {
  text: string;
  language: string;
  duration: number;
}

export interface RephrasingResult {
  originalText: string;
  rephrasedText: string;
  tone: ToneType;
}

/**
 * Transcribe audio file using Groq's Whisper API
 */
export async function transcribeAudio(audioFilePath: string): Promise<TranscriptionResult> {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key not configured. Please set GROQ_API_KEY in your .env file.');
    }

    // Check if file exists and log its size
    const stats = fs.statSync(audioFilePath);
    console.log('Transcribing audio file:', audioFilePath);
    console.log('File size:', stats.size, 'bytes');

    // Read file as buffer and create a Blob
    const fileBuffer = fs.readFileSync(audioFilePath);
    const blob = new Blob([fileBuffer], { type: 'audio/m4a' });

    // Create FormData
    const formData = new FormData();
    formData.append('file', blob, path.basename(audioFilePath));
    formData.append('model', 'whisper-large-v3');
    formData.append('response_format', 'verbose_json');

    console.log('Sending request to Groq...');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as { text: string; language?: string; duration?: number };
    console.log('Transcription successful, text length:', data.text?.length || 0);

    return {
      text: data.text,
      language: data.language || 'en',
      duration: data.duration || 0,
    };
  } catch (error: any) {
    console.error('Transcription error details:', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      type: error?.type,
      cause: error?.cause,
    });
    throw new Error(`Failed to transcribe audio: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Rephrase text using Groq's LLM (llama-3.3-70b)
 */
export async function rephraseText(
  text: string,
  tone: ToneType = 'professional'
): Promise<RephrasingResult> {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key not configured. Please set GROQ_API_KEY in your .env file.');
    }

    const systemPrompt = tonePrompts[tone] || tonePrompts.professional;

    console.log('Rephrasing text with tone:', tone);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    const rephrasedText = data.choices?.[0]?.message?.content || text;

    console.log('Rephrasing successful, output length:', rephrasedText.length);

    return {
      originalText: text,
      rephrasedText: rephrasedText.trim(),
      tone,
    };
  } catch (error: any) {
    console.error('Rephrasing error:', error);
    throw new Error(`Failed to rephrase text: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Process audio: transcribe and rephrase in one call
 */
export async function processAudio(
  audioFilePath: string,
  tone: ToneType = 'professional'
): Promise<{
  transcription: TranscriptionResult;
  rephrasing: RephrasingResult;
}> {
  // First transcribe
  const transcription = await transcribeAudio(audioFilePath);

  // Then rephrase
  const rephrasing = await rephraseText(transcription.text, tone);

  return {
    transcription,
    rephrasing,
  };
}
