'use client';

import { useState } from 'react';
import { Mic, Square, Loader2, Copy, Check, RotateCcw, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { useRecorder } from '@/hooks/useRecorder';
import { transcribeAudio, ContentIntent, Suggestion } from '@/lib/api';

interface RecorderProps {
  token?: string | null;
  onNoteCreated?: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const intentLabels: Record<ContentIntent, string> = {
  job_application: '💼 Job Application',
  college_essay: '🎓 College Essay',
  scholarship_application: '🏆 Scholarship',
  competition_entry: '🏅 Competition Entry',
  club_application: '👥 Club Application',
  cover_letter: '📝 Cover Letter',
  personal_statement: '✍️ Personal Statement',
  project_description: '🔧 Project Description',
  email_draft: '📧 Email',
  meeting_notes: '📋 Meeting Notes',
  general: '📄 Note',
};

const priorityColors: Record<string, string> = {
  high: 'border-red-500/50 bg-red-500/10',
  medium: 'border-amber-500/50 bg-amber-500/10',
  low: 'border-blue-500/50 bg-blue-500/10',
};

const priorityDotColors: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
};

interface RecordingResult {
  original: string;
  processed: string;
  detectedIntent?: ContentIntent;
  suggestions?: Suggestion[];
}

export function Recorder({ token, onNoteCreated }: RecorderProps) {
  const {
    isRecording,
    duration,
    startRecording,
    stopRecording,
    resetRecording,
  } = useRecorder();

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RecordingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleStartRecording = async () => {
    setError(null);
    setResult(null);
    try {
      await startRecording();
    } catch (err) {
      setError('Could not access microphone. Please allow microphone permissions.');
    }
  };

  const handleStopRecording = async () => {
    const blob = await stopRecording();
    if (!blob) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await transcribeAudio(blob, token);
      if (response.success && response.data) {
        setResult({
          original: response.data.originalText,
          processed: response.data.processedText,
          detectedIntent: response.data.detectedIntent,
          suggestions: response.data.suggestions,
        });
        onNoteCreated?.();
      } else {
        setError(response.error || 'Failed to process recording');
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewRecording = () => {
    setResult(null);
    setError(null);
    setCopied(false);
    resetRecording();
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show result view
  if (result) {
    return (
      <div className="space-y-6">
        {/* Detected Intent Badge */}
        {result.detectedIntent && result.detectedIntent !== 'general' && (
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium">
              {intentLabels[result.detectedIntent]}
            </span>
            <span className="text-gray-500 text-sm">AI detected content type</span>
          </div>
        )}

        {/* Enhanced Result */}
        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              ✨ Your Enhanced Note
            </h3>
            <button
              onClick={() => copyToClipboard(result.processed)}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">{result.processed}</p>
        </div>

        {/* AI Suggestions */}
        {result.suggestions && result.suggestions.length > 0 && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="w-full flex items-center justify-between px-4 py-3 bg-amber-500/10 hover:bg-amber-500/15 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <span className="font-medium text-white">Suggestions to Improve</span>
                <span className="text-amber-400/70 text-sm">({result.suggestions.length})</span>
              </div>
              {showSuggestions ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showSuggestions && (
              <div className="p-4 space-y-3">
                {result.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${priorityColors[suggestion.priority]}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${priorityDotColors[suggestion.priority]}`} />
                      <span className="font-medium text-white">{suggestion.title}</span>
                      <span className="ml-auto text-xs text-gray-500 capitalize px-2 py-0.5 bg-gray-800 rounded">
                        {suggestion.type}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{suggestion.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Original (collapsed) */}
        <details className="bg-gray-800/50 rounded-xl">
          <summary className="px-4 py-3 cursor-pointer text-gray-400 text-sm hover:text-gray-300">
            View original transcription
          </summary>
          <p className="px-4 pb-4 text-gray-400 text-sm">{result.original}</p>
        </details>

        {/* New Recording Button */}
        <button
          onClick={handleNewRecording}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Record Another
        </button>
      </div>
    );
  }

  // Recording view
  return (
    <div className="flex flex-col items-center space-y-8 py-8">
      {/* Duration Display */}
      {isRecording && (
        <div className="text-5xl font-mono text-white tabular-nums">
          {formatDuration(duration)}
        </div>
      )}

      {/* Main Button */}
      <div className="relative">
        {!isRecording && !isProcessing && (
          <button
            onClick={handleStartRecording}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/40 transition-all hover:scale-105 active:scale-95"
          >
            <Mic className="w-12 h-12 text-white" />
          </button>
        )}

        {isRecording && (
          <button
            onClick={handleStopRecording}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 flex items-center justify-center shadow-2xl shadow-red-500/40 transition-all hover:scale-105 active:scale-95 animate-pulse"
          >
            <Square className="w-12 h-12 text-white" />
          </button>
        )}

        {isProcessing && (
          <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Status Text */}
      <p className="text-gray-400 text-lg">
        {!isRecording && !isProcessing && 'Tap to record'}
        {isRecording && 'Tap to stop'}
        {isProcessing && 'Enhancing your note...'}
      </p>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-4 text-red-400 text-center max-w-md">
          {error}
        </div>
      )}
    </div>
  );
}
