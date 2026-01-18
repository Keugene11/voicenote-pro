import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables before initializing OpenAI
dotenv.config();

// Initialize OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 120000, // 2 minute timeout
      maxRetries: 3,   // Retry up to 3 times on network errors
    })
  : null;

console.log('OpenAI API key configured:', !!process.env.OPENAI_API_KEY);

function ensureOpenAI(): OpenAI {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.');
  }
  return openai;
}

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
 * Transcribe audio file using OpenAI Whisper (using native fetch)
 */
export async function transcribeAudio(audioFilePath: string): Promise<TranscriptionResult> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Check if file exists and log its size
    const stats = fs.statSync(audioFilePath);
    console.log('Transcribing audio file:', audioFilePath);
    console.log('File size:', stats.size, 'bytes');

    // Read file as buffer and create a Blob
    const fileBuffer = fs.readFileSync(audioFilePath);
    const blob = new Blob([fileBuffer], { type: 'audio/m4a' });

    // Create FormData with native API
    const formData = new FormData();
    formData.append('file', blob, path.basename(audioFilePath));
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');

    console.log('Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
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
 * Transcribe audio from buffer
 */
export async function transcribeAudioBuffer(
  buffer: Buffer,
  filename: string
): Promise<TranscriptionResult> {
  try {
    const client = ensureOpenAI();
    // Create a File-like object from the buffer
    const file = new File([buffer], filename, { type: 'audio/m4a' });

    const response = await client.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'verbose_json',
    });

    return {
      text: response.text,
      language: response.language || 'en',
      duration: response.duration || 0,
    };
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

/**
 * Rephrase text using GPT-4
 */
export async function rephraseText(
  text: string,
  tone: ToneType = 'professional'
): Promise<RephrasingResult> {
  try {
    const client = ensureOpenAI();
    const systemPrompt = tonePrompts[tone] || tonePrompts.professional;

    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
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
    });

    const rephrasedText = response.choices[0]?.message?.content || text;

    return {
      originalText: text,
      rephrasedText: rephrasedText.trim(),
      tone,
    };
  } catch (error) {
    console.error('Rephrasing error:', error);
    throw new Error('Failed to rephrase text');
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
