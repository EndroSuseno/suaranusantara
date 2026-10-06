import React, { useState } from 'react';
import {
  Mic,
  Volume2,
  Users,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Radio,
  BookOpen,
  Award,
  Globe,
  Share2,
} from 'lucide-react';
import { AudioPlayer } from './components/AudioPlayer';
import { SingleSpeakerTab } from './components/SingleSpeakerTab';
import { DualSpeakerTab } from './components/DualSpeakerTab';
import { HistoryList } from './components/HistoryList';
import { GeneratedAudioItem, SpeakerPersona, StylePreset } from './types';
import { PERSONAS, STYLE_PRESETS, SAMPLE_TEXTS } from './constants/presets';

export default function App() {
  const [activeTab, setActiveTab] = useState<'single' | 'dual'>('single');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Currently playing / active generated audio
  const [currentAudio, setCurrentAudio] = useState<GeneratedAudioItem | null>(null);
  const [history, setHistory] = useState<GeneratedAudioItem[]>([]);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Generate Single Speaker Audio via POST /api/tts
  const handleGenerateSingle = async (params: {
    text: string;
    persona: SpeakerPersona;
    stylePreset: StylePreset;
    customStyle?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'single',
          text: params.text,
          voice: params.persona.voice,
          speakerPersona: params.persona.name,
          stylePreset: params.stylePreset.id,
          customStyle: params.customStyle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghasilkan suara audio.');
      }

      if (data.audioBase64) {
        const newItem: GeneratedAudioItem = {
          id: String(Date.now()),
          createdAt: Date.now(),
          text: params.text,
          personaName: params.persona.name,
          voice: params.persona.voice,
          styleName: params.stylePreset.label,
          audioBase64: data.audioBase64,
          mimeType: data.mimeType || 'audio/wav',
          mode: 'single',
        };

        setCurrentAudio(newItem);
        setHistory((prev) => [newItem, ...prev]);

        // Smooth scroll to audio player if on mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Terjadi kesalahan sistem saat menghubungi model Gemini TTS.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Dual Speaker Audio via POST /api/tts
  const handleGenerateDual = async (params: {
    speaker1: { name: string; voice: string; style: string; text: string };
    speaker2: { name: string; voice: string; style: string; text: string };
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'dual',
          dualSpeakers: {
            speaker1: params.speaker1,
            speaker2: params.speaker2,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghasilkan suara dialog.');
      }

      if (data.audioBase64) {
        const newItem: GeneratedAudioItem = {
          id: String(Date.now()),
          createdAt: Date.now(),
          text: `${params.speaker1.name}: "${params.speaker1.text.slice(0, 60)}..." & ${params.speaker2.name}: "${params.speaker2.text.slice(0, 60)}..."`,
          personaName: `${params.speaker1.name} & ${params.speaker2.name}`,
          voice: `${params.speaker1.voice} + ${params.speaker2.voice}`,
          styleName: 'Dialog Dua Penutur',
          audioBase64: data.audioBase64,
          mimeType: data.mimeType || 'audio/wav',
          mode: 'dual',
        };

        setCurrentAudio(newItem);
        setHistory((prev) => [newItem, ...prev]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Terjadi gangguan saat membuat audio percakapan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Top Header */}
      <header className="border-b border-stone-800/80 bg-stone-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Mic className="w-5 h-5 text-stone-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-stone-100 font-serif">
                  SuaraNusantara
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Native Indonesian
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                Studio Penutur Asli Indonesia • Bebas Gaya Asing • Intonasi Manusiawi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="text-xs text-stone-300 hover:text-stone-100 px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/70 transition flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Panduan Bertutur Alami</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>gemini-3.8-flash-tts</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Error notification banner */}
        {error && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-4 rounded-xl flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-semibold">Pemberitahuan Sistem:</strong>
                <p className="text-xs text-rose-300 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs text-rose-400 hover:text-rose-100 p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Panduan Bertutur Alami Drawer / Modal */}
        {showGuide && (
          <div className="bg-stone-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-bold text-amber-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Rahasia Penjelasan Bahasa Indonesia yang Alami & Memikat
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="text-xs text-stone-400 hover:text-stone-200"
              >
                ✕ Tutup
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-stone-300 leading-relaxed">
              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                <strong className="text-stone-100 block mb-1">1. Hindari Susunan Kalimat Kaku</strong>
                Gunakan kata penyambung alami seperti <em>"Nah"</em>, <em>"Rupanya"</em>, <em>"Sebenarnya"</em>, atau <em>"Bayangkan begini"</em> agar terdengar luwes seperti orang bertutur langsung.
              </div>
              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                <strong className="text-stone-100 block mb-1">2. Tarik Napas Alami (&lt;breath&gt;)</strong>
                Manusia tidak bicara tanpa bernapas! Sisipkan tag <code>&lt;breath&gt;</code> sebelum kalimat panjang untuk memberikan dinamika pernapasan manusia asli.
              </div>
              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                <strong className="text-stone-100 block mb-1">3. Tombol "Alirkan Jadi Bahasa Tutur"</strong>
                Jika Anda memiliki teks yang agak formal atau sarat istilah asing, klik tombol penyelarasan teks berbasis model Gemini 3.8 Flash untuk menghaluskannya secara instan.
              </div>
            </div>
          </div>
        )}

        {/* Active Audio Player Section */}
        {currentAudio && (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Rekaman Audio Suara Asli Siap Diputar & Diunduh:</span>
            </div>
            <AudioPlayer
              audioBase64={currentAudio.audioBase64}
              mimeType={currentAudio.mimeType}
              title={`Penjelasan ${currentAudio.personaName}`}
              personaName={currentAudio.personaName}
              voiceName={currentAudio.voice}
              styleName={currentAudio.styleName}
              textSnippet={currentAudio.text}
            />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'single'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>🎙️ Penutur Tunggal (Single Speaker)</span>
            </button>

            <button
              onClick={() => setActiveTab('dual')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'dual'
                  ? 'bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/20'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>👥 Percakapan Interaktif (Dual Speaker)</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-stone-400">
            <Globe className="w-3.5 h-3.5 text-stone-400" />
            <span>Format: WAV 24kHz Mono 16-bit Studio Output</span>
          </div>
        </div>

        {/* Tab Body */}
        {activeTab === 'single' ? (
          <SingleSpeakerTab
            onGenerate={handleGenerateSingle}
            isLoading={isLoading}
          />
        ) : (
          <DualSpeakerTab
            onGenerate={handleGenerateDual}
            isLoading={isLoading}
          />
        )}

        {/* Recording History Section */}
        <div className="pt-4">
          <HistoryList
            items={history}
            activeItemId={currentAudio?.id}
            onSelect={(item) => {
              setCurrentAudio(item);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onClear={() => setHistory([])}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-900/40 py-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-400 font-serif">SuaraNusantara</span>
            <span>•</span>
            <span>Didukung Gemini 3.8 Flash TTS Audio Engine</span>
          </div>
          <div className="text-stone-400">
            Didedikasikan untuk naskah penjelasan, edukasi, dan narasi lisan asli Indonesia.
          </div>
        </div>
      </footer>
    </div>
  );
}
