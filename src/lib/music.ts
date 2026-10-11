export const NOTE_NAMES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

// A4 = 440 Hz, MIDI note 69
export const A4_MIDI = 69;
export const A4_FREQ = 440.0;

/** Convert a MIDI note number to its frequency in Hz. */
export function midiToFreq(midi: number): number {
  return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12);
}

/** Convert a frequency in Hz to the nearest MIDI note number (float). */
export function freqToMidi(freq: number): number {
  return A4_MIDI + 12 * Math.log2(freq / A4_FREQ);
}

/** Get the note name (e.g. "A", "C#") from a MIDI note number. */
export function midiToNoteName(midi: number): string {
  const noteIndex = ((midi % 12) + 12) % 12;
  return NOTE_NAMES[noteIndex];
}

/** Get the octave number from a MIDI note number. */
export function midiToOctave(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

/** Full note label e.g. "A4", "C#5". */
export function midiToFullNote(midi: number): string {
  return `${midiToNoteName(midi)}${midiToOctave(midi)}`;
}

/** Number of cents the given frequency is off from the nearest equal-tempered note. */
export function centsOff(freq: number): number {
  const midiFloat = freqToMidi(freq);
  const nearest = Math.round(midiFloat);
  return (midiFloat - nearest) * 100;
}

export interface NoteInfo {
  name: string;
  octave: number;
  fullNote: string;
  midi: number;
  frequency: number;
  cents: number;
}

/** Full analysis of a detected frequency. */
export function analyzeFrequency(freq: number): NoteInfo {
  const midiFloat = freqToMidi(freq);
  const midi = Math.round(midiFloat);
  return {
    name: midiToNoteName(midi),
    octave: midiToOctave(midi),
    fullNote: midiToFullNote(midi),
    midi,
    frequency: midiToFreq(midi),
    cents: (midiFloat - midi) * 100,
  };
}

// ── Timpani drum definitions ──────────────────────────────────────────────
// Standard 4-drum set ranges (optimal ranges from normative orchestral tuning).
// Each drum covers a range of notes; the player selects a target note per drum.

export interface TimpaniDrum {
  id: string;
  name: string;
  size: string; // drum diameter
  lowNote: string;
  highNote: string;
  defaultNote: string;
  color: string;
}

export const TIMPANI_DRUMS: TimpaniDrum[] = [
  {
    id: 'drum-1',
    name: 'Drum 1 (High)',
    size: '23″',
    lowNote: 'A3',
    highNote: 'F4',
    defaultNote: 'C4',
    color: '#f59e0b',
  },
  {
    id: 'drum-2',
    name: 'Drum 2',
    size: '26″',
    lowNote: 'F3',
    highNote: 'D4',
    defaultNote: 'A3',
    color: '#10b981',
  },
  {
    id: 'drum-3',
    name: 'Drum 3',
    size: '29″',
    lowNote: 'D3',
    highNote: 'A3',
    defaultNote: 'F3',
    color: '#3b82f6',
  },
  {
    id: 'drum-4',
    name: 'Drum 4 (Low)',
    size: '32″',
    lowNote: 'A2',
    highNote: 'E3',
    defaultNote: 'C3',
    color: '#ef4444',
  },
];

/** Parse a note name like "A4" or "C#3" into a MIDI note number. */
export function noteNameToMidi(note: string): number | null {
  const match = note.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return null;
  const [, pitch, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const noteIdx = NOTE_NAMES.indexOf(pitch as NoteName);
  if (noteIdx === -1) return null;
  return (octave + 1) * 12 + noteIdx;
}

/** Parse a note name into its frequency. */
export function noteNameToFreq(note: string): number | null {
  const midi = noteNameToMidi(note);
  if (midi === null) return null;
  return midiToFreq(midi);
}

/** Generate all note names within a range (inclusive). */
export function notesInRange(low: string, high: string): string[] {
  const lowMidi = noteNameToMidi(low);
  const highMidi = noteNameToMidi(high);
  if (lowMidi === null || highMidi === null) return [];
  const result: string[] = [];
  for (let m = lowMidi; m <= highMidi; m++) {
    result.push(midiToFullNote(m));
  }
  return result;
}

/** Standard tempo markings. */
export interface TempoMarking {
  name: string;
  bpm: [number, number];
}

export const TEMPO_MARKINGS: TempoMarking[] = [
  { name: 'Largo', bpm: [40, 60] },
  { name: 'Larghetto', bpm: [60, 66] },
  { name: 'Adagio', bpm: [66, 76] },
  { name: 'Andante', bpm: [76, 108] },
  { name: 'Moderato', bpm: [108, 120] },
  { name: 'Allegro', bpm: [120, 168] },
  { name: 'Presto', bpm: [168, 200] },
  { name: 'Prestissimo', bpm: [200, 260] },
];

export function tempoName(bpm: number): string {
  for (const m of TEMPO_MARKINGS) {
    if (bpm >= m.bpm[0] && bpm < m.bpm[1]) return m.name;
  }
  if (bpm < 40) return 'Largo';
  return 'Prestissimo';
}
