import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Gauge,
  Sparkles,
  Repeat,
  Radio,
} from 'lucide-react';

interface AudioPlayerProps {
  audioBase64: string;
  mimeType?: string;
  title?: string;
  personaName?: string;
  voiceName?: string;
  styleName?: string;
  textSnippet?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioBase64,
  mimeType = 'audio/wav',
  title = 'Audio Penjelasan SuaraNusantara',
  personaName = 'Mbak Ratih',
  voiceName = 'Kore',
  styleName = 'Edukasi Santai',
  textSnippet,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string>('');

  // Prepare Audio Blob URL
  useEffect(() => {
    if (!audioBase64) return;
    try {
      const byteCharacters = atob(audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Auto play when generated
      setIsPlaying(false);
      setCurrentTime(0);

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.error('Error constructing audio blob:', e);
    }
  }, [audioBase64, mimeType]);

  // Audio event bindings
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      if (!isLooping) {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, isLooping]);

  // Handle Play/Pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch((e) => {
        console.error('Playback failed:', e);
      });
    }
  };

  const handleReplay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().then(() => setIsPlaying(true));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) setIsMuted(true);
      else setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    const cleanPersona = personaName.replace(/\s+/g, '-').toLowerCase();
    a.download = `suara-nusantara-${cleanPersona}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Canvas waveform visualizer animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let barOffset = 0;
    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const numBars = 48;
      const barWidth = width / numBars - 2;

      for (let i = 0; i < numBars; i++) {
        let barHeight = 6;
        if (isPlaying) {
          // Dynamic pleasing waveform while playing
          const sin1 = Math.sin((i * 0.2) + (barOffset * 0.08));
          const cos1 = Math.cos((i * 0.15) - (barOffset * 0.05));
          const combined = Math.abs(sin1 * 0.6 + cos1 * 0.4);
          barHeight = Math.max(6, combined * (height * 0.85));
        } else {
          // Gentle resting pattern
          const pseudoStatic = Math.abs(Math.sin(i * 0.35)) * 14 + 6;
          barHeight = pseudoStatic;
        }

        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        // Indonesian warm amber-emerald gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isPlaying) {
          gradient.addColorStop(0, '#f59e0b'); // amber-500
          gradient.addColorStop(0.5, '#10b981'); // emerald-500
          gradient.addColorStop(1, '#059669'); // emerald-600
        } else {
          gradient.addColorStop(0, '#57534e');
          gradient.addColorStop(1, '#292524');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      if (isPlaying) {
        barOffset += 1;
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const speeds = [0.75, 0.9, 1.0, 1.1, 1.25, 1.5];

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          loop={isLooping}
          preload="metadata"
        />
      )}

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
              <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
              Gemini 3.8 Flash TTS
            </span>
            <span className="text-xs text-stone-400">
              Penutur: <strong className="text-stone-200">{personaName}</strong> ({voiceName})
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-stone-100 mt-1">
            {title}
          </h3>
          {textSnippet && (
            <p className="text-xs text-stone-400 line-clamp-1 mt-0.5 max-w-xl italic">
              "{textSnippet}"
            </p>
          )}
        </div>

        {/* Download Button */}
        <button
          onClick={downloadAudio}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 hover:border-stone-600 transition shadow-sm active:scale-95"
          title="Unduh rekaman suara dalam format WAV 24kHz"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Unduh Audio WAV</span>
        </button>
      </div>

      {/* Waveform Canvas */}
      <div className="bg-stone-950/90 border border-stone-800/80 rounded-xl p-3 my-3 shadow-inner">
        <canvas
          ref={canvasRef}
          width={640}
          height={72}
          className="w-full h-18 block cursor-pointer"
          onClick={togglePlay}
        />
      </div>

      {/* Time & Progress Bar */}
      <div className="space-y-1 my-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-stone-400 min-w-10">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition"
          />
          <span className="text-xs font-mono text-stone-400 min-w-10 text-right">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Control Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-800/80 relative z-10">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReplay}
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition active:scale-95"
            title="Mulai Ulang dari Awal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition"
            title={isPlaying ? 'Jeda Audio' : 'Putar Audio'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-lg transition active:scale-95 text-xs flex items-center gap-1 ${
              isLooping
                ? 'text-amber-400 bg-amber-950/40 border border-amber-800/50'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            title="Putar Berulang (Loop)"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1.5 bg-stone-950/80 px-2.5 py-1 rounded-lg border border-stone-800 text-xs">
          <Gauge className="w-3.5 h-3.5 text-stone-400 mr-1 hidden sm:inline" />
          <span className="text-stone-500 text-[11px] mr-1 hidden sm:inline">Tempo:</span>
          {speeds.map((rate) => (
            <button
              key={rate}
              onClick={() => handleSpeedChange(rate)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition ${
                playbackRate === rate
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-stone-400 hover:text-stone-200 p-1"
            title={isMuted ? 'Batal Senyapkan' : 'Senyapkan (Mute)'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-20 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>
    </div>
  );
};
