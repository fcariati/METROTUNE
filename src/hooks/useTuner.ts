import { useCallback, useEffect, useRef, useState } from 'react';
import { detectPitch } from '@/lib/pitchDetection';
import { analyzeFrequency, type NoteInfo } from '@/lib/music';

export interface TunerState {
  frequency: number | null;
  note: NoteInfo | null;
  isListening: boolean;
  error: string | null;
}

export function useTuner() {
  const [frequency, setFrequency] = useState<number | null>(null);
  const [note, setNote] = useState<NoteInfo | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const bufferRef = useRef<Float32Array | null>(null);
  const activeRef = useRef(false);

  const stop = useCallback(() => {
    activeRef.current = false;
    setIsListening(false);

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    setFrequency(null);
    setNote(null);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      bufferRef.current = buffer;

      activeRef.current = true;
      setIsListening(true);

      const tick = () => {
        if (!activeRef.current || !analyserRef.current || !bufferRef.current) {
          return;
        }
        analyserRef.current.getFloatTimeDomainData(bufferRef.current);
        const freq = detectPitch(bufferRef.current, ctx.sampleRate);
        if (freq !== null) {
          setFrequency(freq);
          setNote(analyzeFrequency(freq));
        } else {
          setFrequency(null);
          setNote(null);
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Could not access microphone';
      setError(msg);
      setIsListening(false);
    }
  }, []);

  // Play a reference tone for the given frequency
  const playReferenceTone = useCallback(
    (freq: number, durationMs: number = 2000) => {
      const ctx = audioCtxRef.current ?? new AudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      if (!audioCtxRef.current) audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain.gain.setValueAtTime(0.3, now + durationMs / 1000 - 0.1);
      gain.gain.linearRampToValueAtTime(0, now + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + durationMs / 1000);
    },
    [],
  );

  useEffect(() => {
    return () => {
      activeRef.current = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (sourceRef.current) sourceRef.current.disconnect();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return {
    frequency,
    note,
    isListening,
    error,
    start,
    stop,
    playReferenceTone,
  };
}
