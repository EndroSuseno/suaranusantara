import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Volume2,
  BookOpen,
  Info,
  Check,
  RotateCcw,
  Wind,
  Smile,
  GraduationCap,
  Compass,
  Coffee,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import { SpeakerPersona, StylePreset, TextSample } from '../types';
import { PERSONAS, STYLE_PRESETS, SAMPLE_TEXTS } from '../constants/presets';

interface SingleSpeakerTabProps {
  onGenerate: (params: {
    text: string;
    persona: SpeakerPersona;
    stylePreset: StylePreset;
    customStyle?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const SingleSpeakerTab: React.FC<SingleSpeakerTabProps> = ({
  onGenerate,
  isLoading,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<SpeakerPersona>(PERSONAS[0]);
  const [selectedStyle, setSelectedStyle] = useState<StylePreset>(STYLE_PRESETS[0]);
  const [customStyle, setCustomStyle] = useState<string>('');
  const [showAdvancedStyle, setShowAdvancedStyle] = useState<boolean>(false);
  const [text, setText] = useState<string>(SAMPLE_TEXTS[0].text);
  const [isNaturalizing, setIsNaturalizing] = useState<boolean>(false);
  const [naturalizeMessage, setNaturalizeMessage] = useState<string | null>(null);

  // Estimasi durasi baca: rata-rata orang Indonesia bertutur santai sekitar 120-140 kata/menit
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.ceil((wordCount / 130) * 60);

  const handleSelectSample = (sample: TextSample) => {
    setText(sample.text);
    const persona = PERSONAS.find((p) => p.id === sample.personaId) || PERSONAS[0];
    const style = STYLE_PRESETS.find((s) => s.id === sample.styleId) || STYLE_PRESETS[0];
    setSelectedPersona(persona);
    setSelectedStyle(style);
  };

  const handleInsertTag = (tag: string) => {
    setText((prev) => prev + ` ${tag} `);
  };

  const handleNaturalize = async () => {
    if (!text.trim()) return;
    setIsNaturalizing(true);
    setNaturalizeMessage(null);
    try {
      const res = await fetch('/api/naturalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          goal: selectedStyle.id === 'obrolan-akrab' ? 'santai-akrab' : 'jelas-mengalir',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyelaraskan teks.');

      if (data.naturalText) {
        setText(data.naturalText);
        setNaturalizeMessage('Teks berhasil diselaraskan menjadi bahasa tutur asli yang mengalir!');
        setTimeout(() => setNaturalizeMessage(null), 4000);
      }
    } catch (err: any) {
      alert('Gagal mengubah teks: ' + (err.message || 'Coba lagi nanti'));
    } finally {
      setIsNaturalizing(false);
    }
  };

  const handleClear = () => {
    if (confirm('Hapus seluruh teks naskah?')) {
      setText('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Silakan masukkan teks yang ingin diubah menjadi suara terlebih dahulu.');
      return;
    }
    onGenerate({
      text: text.trim(),
      persona: selectedPersona,
      stylePreset: selectedStyle,
      customStyle: customStyle.trim() || undefined,
    });
  };

  const renderStyleIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-blue-400" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4 text-rose-400" />;
      default:
        return <Smile className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Pemilihan Persona Penutur Asli */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-amber-400" />
              1. Pilih Penutur Asli Indonesia
            </h2>
            <p className="text-xs text-stone-400">
              Setiap penutur dirancang khusus dengan dialek dan intonasi tutur manusia alami tanpa gaya bahasa asing
            </p>
          </div>
          <span className="hidden sm:inline-block text-xs font-mono bg-stone-800 text-stone-300 px-2.5 py-1 rounded-md border border-stone-700">
            Model: gemini-3.8-flash-tts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PERSONAS.map((persona) => {
            const isSelected = selectedPersona.id === persona.id;
            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => setSelectedPersona(persona)}
                className={`text-left p-3.5 rounded-xl border transition-all duration-200 relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-stone-800/90 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500'
                    : 'bg-stone-900/80 border-stone-800 hover:border-stone-700 hover:bg-stone-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-9 h-9 rounded-full bg-gradient-to-br ${persona.avatarBg} flex items-center justify-center font-bold text-stone-100 text-sm shadow`}
                    >
                      {persona.name.charAt(0)}
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-amber-400 text-stone-950 font-bold'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {persona.gender} • {persona.voice}
                    </span>
                  </div>

                  <h3 className="font-semibold text-stone-100 text-sm">{persona.name}</h3>
                  <p className="text-xs text-amber-400/90 font-medium line-clamp-1">
                    {persona.tagline}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {persona.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-800/80">
                  <span className="text-[10px] text-stone-500 block line-clamp-1">
                    Cocok: {persona.bestFor}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Pilihan Gaya Eksplanasi / Gaya Penjelasan */}
      <div className="bg-stone-900/70 border border-stone-800/80 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              2. Pilih Karakter Penjelasan
            </h2>
            <p className="text-xs text-stone-400">
              Menentukan intonasi, dinamika jeda napas, dan suasana tutur saat membawakan penjelasan
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAdvancedStyle(!showAdvancedStyle)}
            className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5 underline decoration-dotted"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {showAdvancedStyle ? 'Sembunyikan Arahan Khusus' : 'Tambah Arahan Khusus'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {STYLE_PRESETS.map((preset) => {
            const isSelected = selectedStyle.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedStyle(preset)}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500 text-stone-100 ring-1 ring-emerald-500/50'
                    : 'bg-stone-950/60 border-stone-800/90 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="mt-0.5 p-1.5 rounded-lg bg-stone-800 border border-stone-700/60">
                  {renderStyleIcon(preset.icon)}
                </div>
                <div>
                  <div className="font-semibold text-xs sm:text-sm text-stone-200">
                    {preset.label}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5 leading-snug">
                    {preset.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Input Gaya Khusus Tambahan */}
        {showAdvancedStyle && (
          <div className="mt-4 pt-3 border-t border-stone-800">
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Arahan Gaya Tambahan untuk Gemini TTS (Opsional):
            </label>
            <input
              type="text"
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              placeholder="Contoh: Nada bicara berbisik misterius, sedikit jeda setiap selesai kalimat penegasan..."
              className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        )}
      </div>

      {/* 3. Teks Naskah Penjelasan */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 sm:p-5 relative">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              3. Tulis Naskah Penjelasan (Bahasa Indonesia Asli)
            </h2>
            <p className="text-xs text-stone-400">
              Gunakan kalimat mengalir yang nyaman diucapkan. Hindari istilah asing yang canggung.
            </p>
          </div>

          {/* Quick Naturalize Helper Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNaturalize}
              disabled={isNaturalizing || !text.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-stone-100 disabled:opacity-50 transition shadow-sm active:scale-95"
              title="Gunakan model Gemini 3.8 Flash untuk menghaluskan susunan kalimat agar murni bertutur seperti orang Indonesia asli"
            >
              {isNaturalizing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyelaraskan Bahasa...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Alirkan Jadi Bahasa Tutur Asli</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition"
              title="Hapus Naskah"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {naturalizeMessage && (
          <div className="mb-3 px-3 py-2 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{naturalizeMessage}</span>
          </div>
        )}

        {/* Text Area */}
        <div className="relative">
          <textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tuliskan teks penjelasan di sini. Misalnya: Mengapa daun berwarna hijau, bagaimana cara menyeduh kopi yang nikmat, atau kiat mengatur waktu kerja harian..."
            className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition leading-relaxed resize-y"
          />

          {/* Quick Insert Vocal Expression Tags */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-stone-800/80">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-stone-400 flex items-center gap-1">
                <Wind className="w-3 h-3 text-emerald-400" />
                Sisipkan ekspresi manusiawi:
              </span>
              <button
                type="button"
                onClick={() => handleInsertTag('<breath>')}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-emerald-300 border border-emerald-900 transition"
                title="Sisipkan tarikan napas alami sebelum kalimat penting"
              >
                + &lt;breath&gt; (Tarik Napas)
              </button>
              <button
                type="button"
                onClick={() => handleInsertTag(', ')}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition"
                title="Sisipkan koma untuk jeda pendek"
              >
                + Jeda Koma
              </button>
              <button
                type="button"
                onClick={() => handleInsertTag('... ')}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition"
                title="Sisipkan jeda berpikir yang santai"
              >
                + Jeda Santai (...)
              </button>
            </div>

            {/* Metrics */}
            <div className="text-[11px] font-mono text-stone-400">
              <span>{wordCount} kata</span>
              <span className="mx-1.5">•</span>
              <span>{text.length} karakter</span>
              <span className="mx-1.5">•</span>
              <span className="text-amber-400">Est. ~{estimatedSeconds} detik</span>
            </div>
          </div>
        </div>

        {/* Koleksi Contoh Naskah Siap Putar */}
        <div className="mt-4 pt-3 border-t border-stone-800/80">
          <div className="text-xs font-semibold text-stone-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Contoh Naskah Penjelasan Alami Nusantara:
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TEXTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="text-xs px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-stone-100 border border-stone-700/60 transition text-left"
              >
                <span className="text-amber-400 font-semibold mr-1">[{sample.category}]</span>
                {sample.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tombol Eksekusi Generator Suara */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:via-amber-500 hover:to-emerald-500 text-stone-950 font-extrabold text-base sm:text-lg tracking-wide shadow-xl shadow-amber-500/10 active:scale-[0.99] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-stone-950" />
              <span>Memproses Suara Penutur Asli ({selectedPersona.name})...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-6 h-6 text-stone-950" />
              <span>Sintesis Suara Penutur Asli ({selectedPersona.name} • {selectedPersona.voice})</span>
            </>
          )}
        </button>
        <p className="text-center text-[11px] text-stone-500 mt-2">
          Didukung oleh model audio murni <strong>gemini-3.8-flash-tts</strong> (resolusi 24kHz studio WAV)
        </p>
      </div>
    </form>
  );
};
