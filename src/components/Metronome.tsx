import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Minus,
  Plus,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Gauge,
  Music,
  Repeat,
  TrendingUp,
} from 'lucide-react';
import { useMetronome, type Subdivision } from '@/hooks/useMetronome';
import { tempoName, TEMPO_MARKINGS } from '@/lib/music';

const SUBDIVISION_LABELS: { value: Subdivision; label: string; symbol: string }[] = [
  { value: 'quarter', label: 'Quarter', symbol: '♩' },
  { value: 'eighth', label: 'Eighth', symbol: '♪♪' },
  { value: 'eighth-triplet', label: 'Triplet 8th', symbol: ' triplet' },
  { value: 'sixteenth', label: 'Sixteenth', symbol: '♬♬' },
  { value: 'sixteenth-triplet', label: 'Triplet 16th', symbol: ' triplet' },
];

const TIME_SIGNATURES = [2, 3, 4, 5, 6, 7];

export default function Metronome() {
  const [bpm, setBpm] = useState(120);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [accentBeats, setAccentBeats] = useState<number[]>([0]);
  const [subdivision, setSubdivision] = useState<Subdivision>('quarter');
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [accelerandoEnabled, setAccelerandoEnabled] = useState(false);
  const [accelerandoTargetBpm, setAccelerandoTargetBpm] = useState(160);
  const [accelerandoBars, setAccelerandoBars] = useState(8);

  const { isPlaying, currentBeat, currentSubdivision, start, stop, updateOptions, currentBpm } =
    useMetronome();

  // Keep the metronome engine updated with latest settings
  useEffect(() => {
    updateOptions({
      bpm,
      beatsPerMeasure,
      accentBeats,
      subdivision,
      volume: muted ? 0 : volume,
      accelerandoEnabled,
      accelerandoTargetBpm,
      accelerandoBars,
    });
  }, [
    bpm,
    beatsPerMeasure,
    accentBeats,
    subdivision,
    volume,
    muted,
    accelerandoEnabled,
    accelerandoTargetBpm,
    accelerandoBars,
    updateOptions,
  ]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start({
        bpm,
        beatsPerMeasure,
        accentBeats,
        subdivision,
        volume: muted ? 0 : volume,
        accelerandoEnabled,
        accelerandoTargetBpm,
        accelerandoBars,
      });
    }
  }, [
    isPlaying,
    start,
    stop,
    bpm,
    beatsPerMeasure,
    accentBeats,
    subdivision,
    volume,
    muted,
    accelerandoEnabled,
    accelerandoTargetBpm,
    accelerandoBars,
  ]);

  // Keyboard shortcuts
  const toggleRef = useRef(togglePlay);
  toggleRef.current = togglePlay;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggleRef.current();
      } else if (e.key === 'ArrowUp' && !e.shiftKey) {
        e.preventDefault();
        setBpm((b) => Math.min(260, b + 1));
      } else if (e.key === 'ArrowDown' && !e.shiftKey) {
        e.preventDefault();
        setBpm((b) => Math.max(20, b - 1));
      } else if (e.key === 'ArrowUp' && e.shiftKey) {
        e.preventDefault();
        setBpm((b) => Math.min(260, b + 10));
      } else if (e.key === 'ArrowDown' && e.shiftKey) {
        e.preventDefault();
        setBpm((b) => Math.max(20, b - 10));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const adjustBpm = (delta: number) => {
    setBpm((b) => Math.max(20, Math.min(260, b + delta)));
  };

  const toggleAccent = (beat: number) => {
    if (beat === 0) return; // downbeat always accented
    setAccentBeats((prev) =>
      prev.includes(beat) ? prev.filter((b) => b !== beat) : [...prev, beat],
    );
  };

  const displayBpm = isPlaying ? Math.round(currentBpm) : bpm;

  return (
    <div className="space-y-6">
      {/* Main display + transport */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center shadow-2xl ring-1 ring-white/10">
        {/* Beat dots */}
        <div className="mb-6 flex items-center justify-center gap-3">
          {Array.from({ length: beatsPerMeasure }, (_, i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-full transition-all duration-100 ${
                isPlaying && currentBeat === i
                  ? i === 0 || accentBeats.includes(i)
                    ? 'bg-amber-400 scale-150 shadow-lg shadow-amber-400/50'
                    : 'bg-emerald-400 scale-150 shadow-lg shadow-emerald-400/50'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* BPM display */}
        <div className="mb-2 flex items-center justify-center gap-4">
          <button
            onClick={() => adjustBpm(-5)}
            className="rounded-full bg-white/5 p-3 text-white/70 transition hover:bg-white/10 hover:text-white active:scale-90"
            aria-label="Decrease tempo by 5"
          >
            <ChevronDown className="h-6 w-6" />
          </button>

          <div className="flex flex-col items-center">
            <input
              type="number"
              min={20}
              max={260}
              value={displayBpm}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v)) setBpm(Math.max(20, Math.min(260, v)));
              }}
              className="w-40 bg-transparent text-center text-7xl font-bold tabular-nums text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm font-medium uppercase tracking-widest text-white/50">
              BPM
            </span>
            <span className="mt-1 text-xs font-medium text-amber-400/80">
              {tempoName(displayBpm)}
            </span>
          </div>

          <button
            onClick={() => adjustBpm(5)}
            className="rounded-full bg-white/5 p-3 text-white/70 transition hover:bg-white/10 hover:text-white active:scale-90"
            aria-label="Increase tempo by 5"
          >
            <ChevronUp className="h-6 w-6" />
          </button>
        </div>

        {/* Tempo slider */}
        <input
          type="range"
          min={20}
          max={260}
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value, 10))}
          className="metronome-slider mb-6 mt-4 w-full max-w-md"
        />

        {/* Tempo marking zones */}
        <div className="mx-auto mb-6 flex max-w-md justify-between text-[10px] uppercase tracking-wider text-white/30">
          {TEMPO_MARKINGS.map((m) => (
            <span key={m.name}>{m.name}</span>
          ))}
        </div>

        {/* Play button */}
        <button
          onClick={togglePlay}
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full transition-all active:scale-90 ${
            isPlaying
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
              : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 hover:bg-emerald-400'
          }`}
        >
          {isPlaying ? (
            <Pause className="h-8 w-8" fill="currentColor" />
          ) : (
            <Play className="h-8 w-8 translate-x-0.5" fill="currentColor" />
          )}
        </button>
        <p className="mt-3 text-xs text-white/30">
          Press <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-white/60">Space</kbd> to start/stop · arrow keys to change tempo
        </p>
      </div>

      {/* Controls grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Time signature & accents */}
        <div className="rounded-2xl bg-white p-5 shadow-lg">
          <div className="mb-3 flex items-center gap-2 text-slate-700">
            <Music className="h-5 w-5 text-slate-400" />
            <h3 className="font-semibold">Time Signature</h3>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {TIME_SIGNATURES.map((ts) => (
              <button
                key={ts}
                onClick={() => {
                  setBeatsPerMeasure(ts);
                  setAccentBeats([0]);
                }}
                className={`h-12 w-12 rounded-xl text-lg font-bold transition ${
                  beatsPerMeasure === ts
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {ts}/4
              </button>
            ))}
          </div>

          <div className="mb-2 text-sm font-medium text-slate-500">
            Tap a beat to toggle accent
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: beatsPerMeasure }, (_, i) => (
              <button
                key={i}
                onClick={() => toggleAccent(i)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition ${
                  i === 0
                    ? 'bg-amber-400 text-white'
                    : accentBeats.includes(i)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Subdivision */}
        <div className="rounded-2xl bg-white p-5 shadow-lg">
          <div className="mb-3 flex items-center gap-2 text-slate-700">
            <Repeat className="h-5 w-5 text-slate-400" />
            <h3 className="font-semibold">Subdivision</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SUBDIVISION_LABELS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSubdivision(s.value)}
                className={`flex flex-col items-center rounded-xl py-3 transition ${
                  subdivision === s.value
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="text-base font-semibold">{s.label}</span>
                <span className="text-xs opacity-60">{s.symbol}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Volume */}
        <div className="rounded-2xl bg-white p-5 shadow-lg">
          <div className="mb-3 flex items-center gap-2 text-slate-700">
            {muted ? (
              <VolumeX className="h-5 w-5 text-slate-400" />
            ) : (
              <Volume2 className="h-5 w-5 text-slate-400" />
            )}
            <h3 className="font-semibold">Volume</h3>
            <button
              onClick={() => setMuted((m) => !m)}
              className="ml-auto rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
            >
              {muted ? 'Unmute' : 'Mute'}
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setMuted(false);
            }}
            className="metronome-slider w-full"
          />
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>Soft</span>
            <span>{Math.round(volume * 100)}%</span>
            <span>Loud</span>
          </div>
        </div>

        {/* Accelerando (tempo increase) */}
        <div className="rounded-2xl bg-white p-5 shadow-lg">
          <div className="mb-3 flex items-center gap-2 text-slate-700">
            <TrendingUp className="h-5 w-5 text-slate-400" />
            <h3 className="font-semibold">Accelerando</h3>
            <label className="ml-auto flex cursor-pointer items-center gap-2">
              <span className="text-xs text-slate-500">
                {accelerandoEnabled ? 'ON' : 'OFF'}
              </span>
              <button
                onClick={() => setAccelerandoEnabled((v) => !v)}
                className={`relative h-6 w-11 rounded-full transition ${
                  accelerandoEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                    accelerandoEnabled ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </label>
          </div>

          <div
            className={`space-y-3 ${accelerandoEnabled ? '' : 'pointer-events-none opacity-40'}`}
          >
            <div>
              <label className="mb-1 flex justify-between text-xs font-medium text-slate-500">
                <span>Target BPM</span>
                <span className="text-slate-700">{accelerandoTargetBpm}</span>
              </label>
              <input
                type="range"
                min={bpm + 5}
                max={260}
                value={Math.max(accelerandoTargetBpm, bpm + 5)}
                onChange={(e) =>
                  setAccelerandoTargetBpm(parseInt(e.target.value, 10))
                }
                className="metronome-slider w-full"
              />
            </div>
            <div>
              <label className="mb-1 flex justify-between text-xs font-medium text-slate-500">
                <span>Ramp over (measures)</span>
                <span className="text-slate-700">{accelerandoBars}</span>
              </label>
              <input
                type="range"
                min={1}
                max={32}
                value={accelerandoBars}
                onChange={(e) =>
                  setAccelerandoBars(parseInt(e.target.value, 10))
                }
                className="metronome-slider w-full"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-500">
              <Gauge className="h-4 w-4 shrink-0 text-slate-400" />
              <span>
                Gradually increases from {bpm} to {accelerandoTargetBpm} BPM over{' '}
                {accelerandoBars} measures.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick tempo presets */}
      <div className="rounded-2xl bg-white p-5 shadow-lg">
        <h3 className="mb-3 font-semibold text-slate-700">Quick Tempo Presets</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Largo', bpm: 50 },
            { label: 'Adagio', bpm: 72 },
            { label: 'Andante', bpm: 92 },
            { label: 'Moderato', bpm: 114 },
            { label: 'Allegro', bpm: 140 },
            { label: 'Vivace', bpm: 160 },
            { label: 'Presto', bpm: 184 },
            { label: 'Prestissimo', bpm: 220 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => setBpm(preset.bpm)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                bpm === preset.bpm
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {preset.label} · {preset.bpm}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
