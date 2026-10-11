import { useCallback, useEffect, useRef, useState } from 'react';

export type Subdivision =
  | 'quarter'
  | 'eighth'
  | 'eighth-triplet'
  | 'sixteenth'
  | 'sixteenth-triplet';

const SUBDIVISIONS: Record<Subdivision, number> = {
  quarter: 1,
  eighth: 2,
  'eighth-triplet': 3,
  sixteenth: 4,
  'sixteenth-triplet': 6,
};

export interface MetronomeOptions {
  bpm: number;
  beatsPerMeasure: number;
  accentBeats: number[]; // 0-indexed beats that are accented (always includes 0)
  subdivision: Subdivision;
  volume: number; // 0..1
  // Accelerando: gradually increase BPM over time
  accelerandoEnabled: boolean;
  accelerandoTargetBpm: number;
  accelerandoBars: number; // how many measures to ramp over
}

interface ScheduledClick {
  time: number;
  beatInMeasure: number;
  isAccent: boolean;
  isDownbeat: boolean;
  subdivisionIndex: number;
  totalSubdivisions: number;
}

function createClickSound(
  ctx: AudioContext,
  time: number,
  freq: number,
  duration: number,
  volume: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = freq;
  osc.type = 'square';
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume, time + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + duration + 0.05);
}

export function useMetronome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentSubdivision, setCurrentSubdivision] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const schedulerTimerRef = useRef<number | null>(null);
  const nextClickTimeRef = useRef(0);
  const scheduledClicksRef = useRef<ScheduledClick[]>([]);
  const beatCounterRef = useRef(0);
  const subdivisionCounterRef = useRef(0);
  const currentBpmRef = useRef(120);
  const startBpmRef = useRef(120);
  const measureCounterRef = useRef(0);
  const optionsRef = useRef<MetronomeOptions | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const options = optionsRef.current;

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const scheduleClick = useCallback(
    (click: ScheduledClick) => {
      const ctx = getCtx();
      const opts = optionsRef.current!;

      let freq = 1200;
      if (click.isDownbeat) freq = 1800;
      else if (click.isAccent) freq = 1500;
      else freq = 1000;

      const dur = click.isDownbeat ? 0.08 : 0.05;
      createClickSound(ctx, click.time, freq, dur, opts.volume);
    },
    [getCtx],
  );

  const scheduleAhead = useCallback(() => {
    const ctx = getCtx();
    const opts = optionsRef.current!;
    const lookahead = 0.1; // schedule 100ms ahead

    while (nextClickTimeRef.current < ctx.currentTime + lookahead) {
      const subDivisions = SUBDIVISIONS[opts.subdivision];
      const beatInMeasure = beatCounterRef.current % opts.beatsPerMeasure;
      const isDownbeat = beatInMeasure === 0;
      const isAccent =
        isDownbeat || opts.accentBeats.includes(beatInMeasure);

      const click: ScheduledClick = {
        time: nextClickTimeRef.current,
        beatInMeasure,
        isAccent,
        isDownbeat,
        subdivisionIndex: subdivisionCounterRef.current % subDivisions,
        totalSubdivisions: subDivisions,
      };

      scheduledClicksRef.current.push(click);
      scheduleClick(click);

      // Advance by one subdivision
      const secondsPerBeat = 60 / currentBpmRef.current;
      const secondsPerSub = secondsPerBeat / subDivisions;
      nextClickTimeRef.current += secondsPerSub;
      subdivisionCounterRef.current++;

      // When we've completed all subdivisions for this beat, advance the beat
      if (subdivisionCounterRef.current % subDivisions === 0) {
        beatCounterRef.current++;
        // Check accelerando on measure boundaries
        if (beatCounterRef.current % opts.beatsPerMeasure === 0) {
          measureCounterRef.current++;
          if (
            opts.accelerandoEnabled &&
            currentBpmRef.current < opts.accelerandoTargetBpm
          ) {
            const bpmIncrement =
              (opts.accelerandoTargetBpm - startBpmRef.current) /
              opts.accelerandoBars;
            currentBpmRef.current = Math.min(
              opts.accelerandoTargetBpm,
              currentBpmRef.current + bpmIncrement,
            );
          }
        }
      }
    }
  }, [getCtx, scheduleClick]);

  const updateVisual = useCallback(() => {
    const ctx = getCtx();
    const opts = optionsRef.current!;
    const now = ctx.currentTime;
    const subDivisions = SUBDIVISIONS[opts.subdivision];

    // Find the most recent scheduled click that has passed
    let lastPastClick: ScheduledClick | null = null;
    for (const click of scheduledClicksRef.current) {
      if (click.time <= now) {
        lastPastClick = click;
      } else {
        break;
      }
    }

    if (lastPastClick) {
      setCurrentBeat(lastPastClick.beatInMeasure);
      setCurrentSubdivision(lastPastClick.subdivisionIndex);
    }

    // Clean up old clicks
    const cutoff = now - 0.5;
    scheduledClicksRef.current = scheduledClicksRef.current.filter(
      (c) => c.time > cutoff,
    );

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateVisual);
    }
  }, [getCtx, isPlaying]);

  const start = useCallback(
    (opts: MetronomeOptions) => {
      optionsRef.current = opts;
      const ctx = getCtx();
      if (ctx.state === 'suspended') ctx.resume();

      beatCounterRef.current = 0;
      subdivisionCounterRef.current = 0;
      measureCounterRef.current = 0;
      currentBpmRef.current = opts.bpm;
      startBpmRef.current = opts.bpm;
      nextClickTimeRef.current = ctx.currentTime + 0.1;
      scheduledClicksRef.current = [];

      setIsPlaying(true);

      const scheduler = () => {
        if (optionsRef.current) {
          scheduleAhead();
          schedulerTimerRef.current = window.setTimeout(scheduler, 25);
        }
      };
      scheduler();

      animationFrameRef.current = requestAnimationFrame(updateVisual);
    },
    [getCtx, scheduleAhead, updateVisual],
  );

  const stop = useCallback(() => {
    setIsPlaying(false);
    if (schedulerTimerRef.current !== null) {
      clearTimeout(schedulerTimerRef.current);
      schedulerTimerRef.current = null;
    }
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    scheduledClicksRef.current = [];
    setCurrentBeat(0);
    setCurrentSubdivision(0);
  }, []);

  // Update options live while playing
  const updateOptions = useCallback(
    (opts: MetronomeOptions) => {
      optionsRef.current = opts;
      if (!isPlaying) {
        currentBpmRef.current = opts.bpm;
        startBpmRef.current = opts.bpm;
      }
    },
    [isPlaying],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (schedulerTimerRef.current !== null) {
        clearTimeout(schedulerTimerRef.current);
      }
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (ctxRef.current) {
        ctxRef.current.close();
      }
    };
  }, []);

  // Restart visual loop when isPlaying changes
  useEffect(() => {
    if (isPlaying && animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(updateVisual);
    }
  }, [isPlaying, updateVisual]);

  const currentBpm = isPlaying ? currentBpmRef.current : options?.bpm ?? 120;

  return {
    isPlaying,
    currentBeat,
    currentSubdivision,
    start,
    stop,
    updateOptions,
    currentBpm,
  };
}
