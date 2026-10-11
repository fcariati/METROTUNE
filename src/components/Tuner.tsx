import { useCallback, useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Target,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { useTuner } from '@/hooks/useTuner';
import {
  TIMPANI_DRUMS,
  notesInRange,
  noteNameToFreq,
  noteNameToMidi,
  type TimpaniDrum,
} from '@/lib/music';

export default function Tuner() {
  const { frequency, note, isListening, error, start, stop, playReferenceTone } =
    useTuner();

  const [selectedDrumId, setSelectedDrumId] = useState(TIMPANI_DRUMS[2].id);
  const [targetNote, setTargetNote] = useState<string>(TIMPANI_DRUMS[2].defaultNote);

  const selectedDrum: TimpaniDrum =
    TIMPANI_DRUMS.find((d) => d.id === selectedDrumId) ?? TIMPANI_DRUMS[0];
  const availableNotes = notesInRange(selectedDrum.lowNote, selectedDrum.highNote);

  const targetFreq = noteNameToFreq(targetNote) ?? 0;
  const targetMidi = noteNameToMidi(targetNote) ?? 0;

  // Cents offset from the *target* note (not just the nearest note)
  const centsFromTarget = note
    ? note.midi === targetMidi
      ? note.cents
      : (note.midi - targetMidi) * 100 + note.cents
    : 0;

  const isInTune = note && Math.abs(centsFromTarget) < 5 && note.midi === targetMidi;

  const toggleListening = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      void start();
    }
  }, [isListening, start, stop]);

  const handleDrumChange = (drumId: string) => {
    setSelectedDrumId(drumId);
    const drum = TIMPANI_DRUMS.find((d) => d.id === drumId);
    if (drum) {
      setTargetNote(drum.defaultNote);
    }
  };

  // Needle angle: -50 cents = -60deg, 0 cents = 0deg, +50 cents = +60deg
  const needleAngle = Math.max(-90, Math.min(90, (centsFromTarget / 50) * 60));

  return (
    <div className="space-y-6">
      {/* Tuner display */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center shadow-2xl ring-1 ring-white/10">
        {/* Status indicator */}
        <div className="mb-4 flex items-center justify-center gap-2 text-sm">
          {isListening ? (
            <span className="flex items-center gap-2 text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Listening...
            </span>
          ) : (
            <span className="flex items-center gap-2 text-white/40">
              <span className="h-2 w-2 rounded-full bg-white/30" />
              Tap to start listening
            </span>
          )}
        </div>

        {/* Note display */}
        <div className="mb-6">
          {note ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-8xl font-bold text-white">{note.name}</span>
              <span className="text-4xl font-medium text-white/50">
                {note.octave}
              </span>
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center text-6xl font-bold text-white/20">
              —
            </div>
          )}
          {frequency && (
            <p className="mt-2 text-sm tabular-nums text-white/40">
              {frequency.toFixed(1)} Hz
            </p>
          )}
        </div>

        {/* Needle gauge */}
        <div className="relative mx-auto mb-6 h-32 w-72 max-w-full">
          {/* Gauge background */}
          <svg viewBox="0 0 300 160" className="h-full w-full">
            {/* Arc background */}
            <path
              d="M 30 140 A 120 120 0 0 1 270 140"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="40"
              strokeLinecap="round"
            />
            {/* Green in-tune zone */}
            <path
              d="M 135 28 A 120 120 0 0 1 165 28"
              fill="none"
              stroke="rgba(52,211,153,0.4)"
              strokeWidth="40"
              strokeLinecap="round"
            />
            {/* Tick marks */}
            {[-50, -25, 0, 25, 50].map((cents) => {
              const angle = (cents / 50) * 60 - 90;
              const rad = (angle * Math.PI) / 180;
              const x1 = 150 + Math.cos(rad) * 100;
              const y1 = 140 + Math.sin(rad) * 100;
              const x2 = 150 + Math.cos(rad) * 80;
              const y2 = 140 + Math.sin(rad) * 80;
              return (
                <line
                  key={cents}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                />
              );
            })}
            {/* Labels */}
            {[
              { cents: -50, label: '♭' },
              { cents: 0, label: '◎' },
              { cents: 50, label: '♯' },
            ].map(({ cents, label }) => {
              const angle = (cents / 50) * 60 - 90;
              const rad = (angle * Math.PI) / 180;
              const x = 150 + Math.cos(rad) * 65;
              const y = 140 + Math.sin(rad) * 65;
              return (
                <text
                  key={cents}
                  x={x}
                  y={y}
                  fill="rgba(255,255,255,0.4)"
                  fontSize="14"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {label}
                </text>
              );
            })}
            {/* Needle */}
            <g
              style={{
                transform: `rotate(${needleAngle}deg)`,
                transformOrigin: '150px 140px',
                transition: 'transform 0.08s ease-out',
              }}
            >
              <line
                x1="150"
                y1="140"
                x2="150"
                y2="35"
                stroke={isInTune ? '#34d399' : Math.abs(centsFromTarget) > 30 ? '#f87171' : '#fbbf24'}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="150" cy="140" r="8" fill={isInTune ? '#34d399' : '#fbbf24'} />
            </g>
          </svg>
        </div>

        {/* Cents readout */}
        <div className="mb-6">
          {note ? (
            <div className="space-y-1">
              <p
                className={`text-2xl font-bold tabular-nums ${
                  isInTune
                    ? 'text-emerald-400'
                    : Math.abs(centsFromTarget) > 30
                      ? 'text-rose-400'
                      : 'text-amber-400'
                }`}
              >
                {centsFromTarget > 0 ? '+' : ''}
                {centsFromTarget.toFixed(0)} cents
              </p>
              {isInTune ? (
                <p className="flex items-center justify-center gap-1 text-sm font-medium text-emerald-400">
                  <Check className="h-4 w-4" /> In tune!
                </p>
              ) : (
                <p className="text-sm text-white/50">
                  {centsFromTarget > 0 ? 'Sharp — lower the pitch' : 'Flat — raise the pitch'}
                  {note.midi !== targetMidi && ` (playing ${note.fullNote})`}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/30">Play or sing a note to detect pitch</p>
          )}
        </div>

        {/* Mic toggle */}
        <button
          onClick={toggleListening}
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full transition-all active:scale-90 ${
            isListening
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
              : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 hover:bg-emerald-400'
          }`}
        >
          {isListening ? (
            <MicOff className="h-7 w-7" />
          ) : (
            <Mic className="h-7 w-7" />
          )}
        </button>

        {error && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-rose-500/10 px-4 py-2 text-sm text-rose-400">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>

      {/* Drum selector */}
      <div className="rounded-2xl bg-white p-5 shadow-lg">
        <div className="mb-4 flex items-center gap-2 text-slate-700">
          <Target className="h-5 w-5 text-slate-400" />
          <h3 className="font-semibold">Select Timpani Drum</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {TIMPANI_DRUMS.map((drum) => (
            <button
              key={drum.id}
              onClick={() => handleDrumChange(drum.id)}
              className={`rounded-xl border-2 p-4 text-left transition ${
                selectedDrumId === drum.id
                  ? 'border-slate-800 bg-slate-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: drum.color }}
                />
                <span className="text-sm font-semibold text-slate-700">
                  {drum.size}
                </span>
              </div>
              <p className="text-xs text-slate-500">{drum.name}</p>
              <p className="mt-1 text-xs text-slate-400">
                {drum.lowNote} – {drum.highNote}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Target note selector */}
      <div className="rounded-2xl bg-white p-5 shadow-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-700">
            <Target className="h-5 w-5 text-slate-400" />
            <h3 className="font-semibold">Target Note</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              Current: <span className="font-bold text-slate-800">{targetNote}</span>{' '}
              ({targetFreq.toFixed(1)} Hz)
            </span>
            <button
              onClick={() => playReferenceTone(targetFreq, 2500)}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 active:scale-95"
            >
              <Volume2 className="h-4 w-4" />
              Play Reference
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableNotes.map((n) => {
            const isCurrent = n === targetNote;
            const isDetected = note?.fullNote === n;
            return (
              <button
                key={n}
                onClick={() => setTargetNote(n)}
                className={`relative rounded-lg px-4 py-2 text-sm font-bold transition ${
                  isCurrent
                    ? 'bg-slate-800 text-white shadow-md'
                    : isDetected
                      ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {n}
                {isDetected && !isCurrent && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tuning tips */}
      <div className="rounded-2xl bg-amber-50 p-5 shadow-lg ring-1 ring-amber-200">
        <h3 className="mb-3 font-semibold text-amber-800">Quick Tuning Tips</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            Strike the drum firmly near the edge with the mallet for the clearest pitch.
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            Use the reference tone button to match by ear, then verify with the tuner.
          </li>
          <li className="flex items-start gap-2">
            <X className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            Avoid touching the pedal while the mic is active — mechanical noise disrupts detection.
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            Aim for within ±5 cents for a clean, resonant tone.
          </li>
        </ul>
      </div>
    </div>
  );
}
