import React, { useState } from 'react';
import {
  Users,
  MessageSquare,
  Sparkles,
  Loader2,
  Wand2,
  Volume2,
  RotateCcw,
  Bot,
} from 'lucide-react';
import { PERSONAS } from '../constants/presets';

interface DualSpeakerTabProps {
  onGenerate: (params: {
    speaker1: { name: string; voice: string; style: string; text: string };
    speaker2: { name: string; voice: string; style: string; text: string };
  }) => Promise<void>;
  isLoading: boolean;
}

export const DualSpeakerTab: React.FC<DualSpeakerTabProps> = ({
  onGenerate,
  isLoading,
}) => {
  const [topic, setTopic] = useState<string>('Mengapa kita bisa merasa mengantuk setelah makan siang?');
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);

  const [sp1Name, setSp1Name] = useState<string>('Ratih');
  const [sp1Voice, setSp1Voice] = useState<string>('Kore');
  const [sp1Style, setSp1Style] = useState<string>(
    'Penutur asli Indonesia wanita, ramah, bertanya dengan rasa penasaran yang wajar dan gaya bicara santai.'
  );
  const [sp1Text, setSp1Text] = useState<string>(
    'Dimas, kamu pernah heran tidak, kenapa ya setiap kali selesai makan siang yang kenyang, mata kita langsung terasa berat sekali dan bawaannya ingin tidur?'
  );

  const [sp2Name, setSp2Name] = useState<string>('Dimas');
  const [sp2Voice, setSp2Voice] = useState<string>('Puck');
  const [sp2Style, setSp2Style] = useState<string>(
    'Penutur asli Indonesia pria, menjelaskan santai sambil tersenyum, nada mengalir jelas seperti mengobrol dengan rekan akrab.'
  );
  const [sp2Text, setSp2Text] = useState<string>(
    'Nah, itu hal yang sangat wajar, Ratih. <breath> Saat makanan masuk ke lambung, tubuh kita mengerahkan banyak energi untuk proses pencernaan. Aliran darah pun terfokus ke saluran cerna, ditambah lagi ada hormon yang membuat tubuh kita merasa rileks.'
  );

  const handleGenerateScript = async () => {
    if (!topic.trim()) return;
    setIsGeneratingScript(true);
    try {
      const res = await fetch('/api/generate-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal merancang dialog.');

      if (data.dialogue) {
        setSp1Name(data.dialogue.speaker1.name || 'Ratih');
        setSp1Text(data.dialogue.speaker1.text || '');
        setSp2Name(data.dialogue.speaker2.name || 'Dimas');
        setSp2Text(data.dialogue.speaker2.text || '');
      }
    } catch (err: any) {
      alert('Gagal membuat naskah percakapan: ' + (err.message || 'Coba lagi nanti'));
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sp1Text.trim() || !sp2Text.trim()) {
      alert('Mohon isi naskah untuk kedua pembicara.');
      return;
    }
    onGenerate({
      speaker1: {
        name: sp1Name,
        voice: sp1Voice,
        style: sp1Style,
        text: sp1Text.trim(),
      },
      speaker2: {
        name: sp2Name,
        voice: sp2Voice,
        style: sp2Style,
        text: sp2Text.trim(),
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Banner & Topic Generator */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Mode Dialog Penjelasan Dua Penutur Asli
            </h2>
            <p className="text-xs text-stone-400">
              Dua penutur saling menanggapi dan menjelaskan konsep secara interaktif dengan backchanneling khas Indonesia
            </p>
          </div>
          <span className="text-xs font-mono bg-stone-800 text-stone-300 px-2.5 py-1 rounded-md border border-stone-700">
            multiSpeakerVoiceConfig
          </span>
        </div>

        {/* Quick Topic Prompter */}
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ketik topik apa saja (misal: Mengapa air kelapa menyegarkan?)"
            className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={handleGenerateScript}
            disabled={isGeneratingScript || !topic.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-700 hover:bg-emerald-600 text-stone-100 disabled:opacity-50 transition active:scale-95 shadow"
          >
            {isGeneratingScript ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Merancang Dialog...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-amber-300" />
                <span>Buatkan Naskah Tanya-Jawab</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Two Speakers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Speaker 1 */}
        <div className="bg-stone-900/90 border border-amber-900/40 rounded-2xl p-4 sm:p-5 relative">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-stone-950 font-bold flex items-center justify-center text-sm shadow">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-200">Pembicara 1 (Penanya / Pembuka)</h3>
                <span className="text-[11px] text-amber-400 font-medium">{sp1Name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] text-stone-400">Suara:</label>
              <select
                value={sp1Voice}
                onChange={(e) => setSp1Voice(e.target.value)}
                className="bg-stone-800 text-stone-200 text-xs rounded-lg px-2 py-1 border border-stone-700 focus:outline-none focus:border-amber-500"
              >
                <option value="Kore">Kore (Wanita Ramah)</option>
                <option value="Zephyr">Zephyr (Wanita Lembut)</option>
                <option value="Puck">Puck (Pria Santai)</option>
                <option value="Fenrir">Fenrir (Pria Matang)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">
                Nama Pembicara:
              </label>
              <input
                type="text"
                value={sp1Name}
                onChange={(e) => setSp1Name(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">
                Kalimat / Pernyataan:
              </label>
              <textarea
                rows={4}
                value={sp1Text}
                onChange={(e) => setSp1Text(e.target.value)}
                placeholder="Kalimat yang diucapkan oleh pembicara 1..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs sm:text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 leading-relaxed resize-y"
              />
            </div>
          </div>
        </div>

        {/* Speaker 2 */}
        <div className="bg-stone-900/90 border border-emerald-900/40 rounded-2xl p-4 sm:p-5 relative">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-stone-950 font-bold flex items-center justify-center text-sm shadow">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-200">Pembicara 2 (Penjelas Konsep)</h3>
                <span className="text-[11px] text-emerald-400 font-medium">{sp2Name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] text-stone-400">Suara:</label>
              <select
                value={sp2Voice}
                onChange={(e) => setSp2Voice(e.target.value)}
                className="bg-stone-800 text-stone-200 text-xs rounded-lg px-2 py-1 border border-stone-700 focus:outline-none focus:border-emerald-500"
              >
                <option value="Puck">Puck (Pria Santai)</option>
                <option value="Fenrir">Fenrir (Pria Matang)</option>
                <option value="Charon">Charon (Pria Bariton)</option>
                <option value="Kore">Kore (Wanita Ramah)</option>
                <option value="Zephyr">Zephyr (Wanita Lembut)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">
                Nama Pembicara:
              </label>
              <input
                type="text"
                value={sp2Name}
                onChange={(e) => setSp2Name(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">
                Penjelasan / Jawaban:
              </label>
              <textarea
                rows={4}
                value={sp2Text}
                onChange={(e) => setSp2Text(e.target.value)}
                placeholder="Penjelasan yang diucapkan oleh pembicara 2..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs sm:text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-emerald-500 leading-relaxed resize-y"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || !sp1Text.trim() || !sp2Text.trim()}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-500 hover:via-teal-500 hover:to-amber-500 text-stone-950 font-extrabold text-base sm:text-lg tracking-wide shadow-xl active:scale-[0.99] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-stone-950" />
              <span>Memproses Percakapan Dua Penutur Asli...</span>
            </>
          ) : (
            <>
              <Users className="w-6 h-6 text-stone-950" />
              <span>Sintesis Dialog Dua Pembicara ({sp1Name} & {sp2Name})</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
