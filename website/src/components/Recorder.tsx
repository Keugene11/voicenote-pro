'use client';

import { useState } from 'react';
import { Mic, Square, Pause, Play, Loader2, Check } from 'lucide-react';
import { useRecorder } from '@/hooks/useRecorder';
import { transcribeAudio } from '@/lib/api';

interface RecorderProps {
  token: string;
  onNoteCreated?: () => void;
}

const TONES = [
  { value: 'professional', label: 'Professional', emoji: '💼' },
  { value: 'casual', label: 'Casual', emoji: '😎' },
  { value: 'concise', label: 'Concise', emoji: '📝' },
  { value: 'email', label: 'Email', emoji: '📧' },
  { value: 'meeting_notes', label: 'Meeting Notes', emoji: '📋' },
  { value: 'original', label: 'Original', emoji: '🎤' },
];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function Recorder({ token, onNoteCreated }: RecorderProps) {
  const {
    isRecording,
    isPaused,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  } = useRecorder();

  const [selectedTone, setSelectedTone] = useState('professional');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ original: string; processed: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const response = await transcribeAudio(blob, token, selectedTone);
      if (response.success && response.data) {
        setResult({
          original: response.data.originalText,
          processed: response.data.processedText,
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
    resetRecording();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Your Note</h2>
          <button
            onClick={handleNewRecording}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
          >
            New Recording
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Original Transcription</h3>
              <button
                onClick={() => copyToClipboard(result.original)}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                Copy
              </button>
            </div>
            <p className="text-gray-300 text-sm">{result.original}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-purple-300">
                ✨ Enhanced ({TONES.find(t => t.value === selectedTone)?.label})
              </h3>
              <button
                onClick={() => copyToClipboard(result.processed)}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                Copy
              </button>
            </div>
            <p className="text-white whitespace-pre-wrap">{result.processed}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tone Selector */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Select Tone</h3>
        <div className="grid grid-cols-3 gap-2">
          {TONES.map((tone) => (
            <button
              key={tone.value}
              onClick={() => setSelectedTone(tone.value)}
              disabled={isRecording}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTone === tone.value
                  ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {tone.emoji} {tone.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex flex-col items-center space-y-6">
        {/* Duration Display */}
        <div className="text-4xl font-mono text-white">
          {formatDuration(duration)}
        </div>

        {/* Recording Button */}
        <div className="flex items-center space-x-4">
          {!isRecording && !isProcessing && (
            <button
              onClick={handleStartRecording}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
            >
              <Mic className="w-8 h-8 text-white" />
            </button>
          )}

          {isRecording && (
            <>
              <button
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-all"
              >
                {isPaused ? (
                  <Play className="w-6 h-6 text-white" />
                ) : (
                  <Pause className="w-6 h-6 text-white" />
                )}
              </button>

              <button
                onClick={handleStopRecording}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30 transition-all hover:scale-105 animate-pulse"
              >
                <Square className="w-8 h-8 text-white" />
              </button>
            </>
          )}

          {isProcessing && (
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Status Text */}
        <p className="text-gray-400 text-sm">
          {!isRecording && !isProcessing && 'Tap to start recording'}
          {isRecording && !isPaused && 'Recording... tap red button to stop'}
          {isRecording && isPaused && 'Paused'}
          {isProcessing && 'Processing your recording...'}
        </p>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
