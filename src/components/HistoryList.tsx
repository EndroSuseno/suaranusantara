import React from 'react';
import { Play, Download, Trash2, Clock, Mic, Users } from 'lucide-react';
import { GeneratedAudioItem } from '../types';

interface HistoryListProps {
  items: GeneratedAudioItem[];
  onSelect: (item: GeneratedAudioItem) => void;
  onClear: () => void;
  activeItemId?: string;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  items,
  onSelect,
  onClear,
  activeItemId,
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-8 text-center text-stone-500">
        <Mic className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
        <p className="text-sm font-medium text-stone-400">Belum ada riwayat rekaman suara</p>
        <p className="text-xs text-stone-500 mt-1">
          Suara yang Anda buat akan tersimpan di sini selama sesi aktif
        </p>
      </div>
    );
  }

  const handleDownload = (item: GeneratedAudioItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const byteCharacters = atob(item.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: item.mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suara-nusantara-${item.personaName.toLowerCase().replace(/\s+/g, '-')}-${item.id}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-stone-200">
            Riwayat Suara Sesi Ini ({items.length})
          </h3>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-stone-400 hover:text-red-400 flex items-center gap-1 transition"
          title="Kosongkan Riwayat"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus Semua</span>
        </button>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => {
          const isActive = activeItemId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                isActive
                  ? 'bg-stone-800 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                  : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 hover:bg-stone-800/40'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-amber-400'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-200">
                      {item.personaName} ({item.voice})
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-400">
                      {item.styleName}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {formatTimestamp(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 truncate mt-0.5 max-w-md">
                    {item.text}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => handleDownload(item, e)}
                  className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-700/60 rounded-lg transition"
                  title="Unduh file WAV"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
