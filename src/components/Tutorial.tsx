import { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Drum,
  Ear,
  Gauge,
  Hand,
  Lightbulb,
  ListChecks,
  Music2,
  Wrench,
  Zap,
  AlertTriangle,
  Volume2,
} from 'lucide-react';
import { useTuner } from '@/hooks/useTuner';
import { TIMPANI_DRUMS, noteNameToFreq } from '@/lib/music';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function Tutorial() {
  const [openSection, setOpenSection] = useState<string | null>('intro');
  const { playReferenceTone } = useTuner();

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const sections: Section[] = [
    {
      id: 'intro',
      title: 'Introduction to Timpani',
      icon: <BookOpen className="h-5 w-5" />,
      content: (
        <div className="space-y-3 text-slate-600">
          <p>
            Timpani (also called <em>kettledrums</em>) are the only orchestral drums that
            produce a definite pitch. Each drum has a pedal-operated tension mechanism that
            changes the pitch by stretching or relaxing the head. A skilled timpanist is
            both a percussionist and a tuner — the quality of the sound depends heavily on
            how precisely each drum is tuned.
          </p>
          <p>
            A standard set uses four drums ranging from approximately 23″ to 32″ in diameter.
            Each drum covers a specific range of about a sixth (an interval of six scale
            degrees). Tuning outside the optimal range produces a thin or muddy tone.
          </p>
          <div className="rounded-xl bg-slate-50 p-4">
            <h4 className="mb-2 font-semibold text-slate-700">Standard 4-Drum Set</h4>
            <div className="space-y-2">
              {TIMPANI_DRUMS.map((d) => (
                <div key={d.id} className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-sm font-medium text-slate-700">{d.size}</span>
                  <span className="text-sm text-slate-500">
                    {d.lowNote} – {d.highNote}
                  </span>
                  <button
                    onClick={() => {
                      const freq = noteNameToFreq(d.defaultNote);
                      if (freq) playReferenceTone(freq, 2000);
                    }}
                    className="ml-auto flex items-center gap-1 rounded-md bg-slate-200 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-300"
                  >
                    <Volume2 className="h-3 w-3" />
                    {d.defaultNote}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'anatomy',
      title: 'Anatomy of a Timpano',
      icon: <Drum className="h-5 w-5" />,
      content: (
        <div className="space-y-3 text-slate-600">
          <p>Understanding the parts of the drum helps you diagnose tuning problems.</p>
          <ul className="space-y-2">
            <li>
              <strong className="text-slate-700">Head (membrane):</strong> The synthetic or
              calfskin surface you strike. Its tension determines the pitch.
            </li>
            <li>
              <strong className="text-slate-700">Bowl (kettle):</strong> The hemispherical
              copper shell that resonates and projects the sound. Its shape gives timpani
              their characteristic rich tone.
            </li>
            <li>
              <strong className="text-slate-700">Counterhoop & tension rods:</strong> The
              metal ring that clamps the head, adjusted by rods around the rim. These must
              be evenly tensioned for a clear pitch.
            </li>
            <li>
              <strong className="text-slate-700">Pedal:</strong> The foot pedal that
              continuously changes head tension, allowing pitch changes during performance.
            </li>
            <li>
              <strong className="text-slate-700">Tuning gauge:</strong> A mechanical
              indicator on some drums that shows the current pitch. Useful but should be
              verified by ear.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'head-clearing',
      title: 'Clearing the Head',
      icon: <Wrench className="h-5 w-5" />,
      content: (
        <div className="space-y-3 text-slate-600">
          <p>
            <strong className="text-slate-700">Clearing the head</strong> is the process of
            equalizing tension at every tension rod so the drum produces a single, focused
            pitch rather than a wobbly, multipitched sound. This is the foundation of good
            timpani tuning.
          </p>
          <div className="rounded-xl bg-blue-50 p-4">
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-blue-800">
              <ListChecks className="h-4 w-4" /> Step-by-step head clearing
            </h4>
            <ol className="space-y-3 text-sm text-blue-700">
              <li>
                <strong>1. Set the pedal</strong> to a mid-range note for the drum (e.g., G3
                for a 29″ drum).
              </li>
              <li>
                <strong>2. Mute the head</strong> lightly with one hand to dampen overtones.
              </li>
              <li>
                <strong>3. Tap near each rod</strong> — strike the head about 1 inch from
                the counterhoop, directly adjacent to each tension rod, using a hard mallet
                or your finger.
              </li>
              <li>
                <strong>4. Listen for pitch consistency.</strong> Each tap should produce
                the same pitch. If one spot is higher, loosen that rod slightly; if lower,
                tighten it.
              </li>
              <li>
                <strong>5. Work in pairs.</strong> Adjust opposite rods (12 o'clock / 6
                o'clock, then 3 / 9, etc.) to keep tension balanced.
              </li>
              <li>
                <strong>6. Repeat</strong> until all spots produce the same pitch — the head
                is now "clear."
              </li>
            </ol>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Always make small adjustments (1/8 turn or less). Large turns destabilize the
              head and you'll have to start over.
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'tuning-process',
      title: 'The Tuning Process',
      icon: <Gauge className="h-5 w-5" />,
      content: (
        <div className="space-y-3 text-slate-600">
          <p>
            Once the head is clear, you can tune to specific pitches. Here's the full
            workflow a professional timpanist follows.
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs text-white">1</span>
                Set the reference pitch
              </h4>
              <p className="text-sm">
                Obtain the ensemble's A (usually A4 = 440 Hz or A4 = 442 Hz). Use a tuning
                fork, electronic tuner, or the oboe's A. Hum or internalize the pitch
                before approaching the drum.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs text-white">2</span>
                Find the note with the pedal
              </h4>
              <p className="text-sm">
                Move the pedal up or down while striking the drum. Get close to the target
                pitch by ear first. The pedal allows smooth, continuous pitch changes.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs text-white">3</span>
                Fine-tune with the tuner
              </h4>
              <p className="text-sm">
                Use the built-in tuner (the Tuner tab) to check the exact pitch. Strike the
                drum near the edge and watch the needle. Adjust the pedal micro-movements
                until the cents reading is within ±5 of zero.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs text-white">4</span>
                Verify by ear
              </h4>
              <p className="text-sm">
                Always confirm the tuning by ear. Play the note with the reference tone and
                listen for beats (pulsing interference). No beats = perfectly in tune.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs text-white">5</span>
                Check harmonics
              </h4>
              <p className="text-sm">
                A well-tuned drum has harmonics that are integer multiples of the
                fundamental. Strike firmly and listen — the tone should be focused and
                ringing, not harsh or diffuse.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'by-ear',
      title: 'Training Your Ear',
      icon: <Ear className="h-5 w-5" />,
      content: (
        <div className="space-y-3 text-slate-600">
          <p>
            While a tuner is a great aid, a professional timpanist must tune by ear — you
            can't stare at a screen during a performance. Here's how to develop this skill.
          </p>
          <div className="space-y-2">
            <div className="rounded-lg bg-emerald-50 p-3">
              <h4 className="mb-1 text-sm font-semibold text-emerald-800">
                Listen for beats
              </h4>
              <p className="text-sm text-emerald-700">
                When two notes are close but not identical, you hear a "wah-wah" pulsing
                called beats. The closer the tuning, the slower the beats. When beats
                disappear, you're in tune.
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <h4 className="mb-1 text-sm font-semibold text-emerald-800">
                Practice with reference tones
              </h4>
              <p className="text-sm text-emerald-700">
                Use the reference tone buttons throughout this tutorial. Play the tone, hum
                it, then strike the drum and compare. Repeat until you can reliably match
                within a few seconds.
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <h4 className="mb-1 text-sm font-semibold text-emerald-800">
                Learn the "in-tune" feeling
              </h4>
              <p className="text-sm text-emerald-700">
                When perfectly in tune, the drum rings freely and the tone feels locked in.
                When slightly off, there's a subtle unease or wobble. Train yourself to
                recognize that clarity.
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-slate-700">
              <Music2 className="h-4 w-4" /> Ear training reference tones
            </h4>
            <p className="mb-3 text-sm text-slate-500">
              Play these tones and try to sing or hum each one before checking yourself with
              the tuner.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { note: 'A2', freq: 110.0 },
                { note: 'D3', freq: 146.83 },
                { note: 'F3', freq: 174.61 },
                { note: 'A3', freq: 220.0 },
                { note: 'C4', freq: 261.63 },
                { note: 'E4', freq: 329.63 },
              ].map(({ note, freq }) => (
                <button
                  key={note}
                  onClick={() => playReferenceTone(freq, 2500)}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-sm font-bold text-white transition hover:bg-slate-700 active:scale-95"
                >
                  <Volume2 className="h-4 w-4" />
                  {note}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'pedal-technique',
      title: 'Pedal Technique & Quick Changes',
      icon: <Hand className="h-5 w-5" />,
      content: (
        <div className="space-y-3 text-slate-600">
          <p>
            Many orchestral passages require quick pitch changes between notes. The pedal
            is your primary tool for this. Mastering pedal technique lets you re-tune
            silently during rests.
          </p>
          <ul className="space-y-2">
            <li>
              <strong className="text-slate-700">Toe-heel motion:</strong> Rock the pedal
              smoothly between the toe (highest position) and heel (lowest position) for
              large pitch changes.
            </li>
            <li>
              <strong className="text-slate-700">Micro-adjustments:</strong> For fine
              tuning, make tiny pedal movements while striking the drum to check pitch.
            </li>
            <li>
              <strong className="text-slate-700">Silent changes:</strong> Mute the head with
              your hand while changing pitch to avoid unwanted sound during performance.
            </li>
            <li>
              <strong className="text-slate-700">Preset positions:</strong> Some drums have
              a ratchet or memory lock that lets you return to a previously set pitch
              instantly. Mark commonly used pitches on the gauge.
            </li>
          </ul>
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Practice changing between two notes (e.g., C3 and F3) repeatedly until you can
              do it in under 3 seconds. Time yourself with the metronome!
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'mallet-selection',
      title: 'Mallet Selection',
      icon: <Zap className="h-5 w-5" />,
      content: (
        <div className="space-y-3 text-slate-600">
          <p>
            The mallet you choose dramatically affects the tone and how clearly the pitch
            speaks. Different mallets reveal or mask the fundamental pitch differently.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-2 pr-4 font-medium">Mallet Type</th>
                  <th className="pb-2 pr-4 font-medium">Sound</th>
                  <th className="pb-2 font-medium">Best For</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium text-slate-700">Hard / Wood-core</td>
                  <td className="py-2 pr-4">Bright, articulate, clear pitch</td>
                  <td className="py-2">Tuning checks, rhythmic passages</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium text-slate-700">Medium</td>
                  <td className="py-2 pr-4">Balanced tone and projection</td>
                  <td className="py-2">General orchestral playing</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium text-slate-700">Soft / Felt</td>
                  <td className="py-2 pr-4">Warm, mellow, rich fundamental</td>
                  <td className="py-2">Rolls, lyrical passages, loud tutti</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-slate-700">Ultra-soft / Cartwheel</td>
                  <td className="py-2 pr-4">Very soft, maximum sustain</td>
                  <td className="py-2">Pianissimo rolls, thunder effects</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>
              When tuning, always use the same mallet you'll perform with. A hard mallet
              makes pitch easier to read but produces a brighter tone that may not match the
              performance context.
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'common-problems',
      title: 'Common Problems & Solutions',
      icon: <AlertTriangle className="h-5 w-5" />,
      content: (
        <div className="space-y-3 text-slate-600">
          <div className="space-y-3">
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
              <h4 className="mb-1 font-semibold text-rose-800">Wobbly or unclear pitch</h4>
              <p className="text-sm text-rose-700">
                <strong>Cause:</strong> Uneven head tension (head not clear).<br />
                <strong>Fix:</strong> Go through the head-clearing process. Tap near each
                rod and equalize the pitch all around.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h4 className="mb-1 font-semibold text-amber-800">Drum won't reach target pitch</h4>
              <p className="text-sm text-amber-700">
                <strong>Cause:</strong> The note is outside the drum's optimal range.<br />
                <strong>Fix:</strong> Choose a different drum. Forcing a pitch beyond the
                range damages the head and produces poor tone.
              </p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-1 font-semibold text-blue-800">Pitch drifts after tuning</h4>
              <p className="text-sm text-blue-700">
                <strong>Cause:</strong> Temperature/humidity changes, or the head hasn't
                settled.<br />
                <strong>Fix:</strong> Retune after 10–15 minutes of playing. New heads need
                a break-in period; stretch them by pressing firmly with your palms before
                clearing.
              </p>
            </div>
            <div className="rounded-lg border border-slate-300 bg-slate-50 p-4">
              <h4 className="mb-1 font-semibold text-slate-800">Tuner shows inconsistent readings</h4>
              <p className="text-sm text-slate-600">
                <strong>Cause:</strong> Background noise, overtones, or striking too
                softly.<br />
                <strong>Fix:</strong> Strike firmly near the edge with a hard mallet. Move
                away from other instruments. The tuner reads the strongest fundamental —
                give it a clear signal.
              </p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <h4 className="mb-1 font-semibold text-emerald-800">Buzzing or rattling</h4>
              <p className="text-sm text-emerald-700">
                <strong>Cause:</strong> Loose tension rods, pedal mechanism, or foreign
                objects on the head.<br />
                <strong>Fix:</strong> Check all hardware. Remove dust or debris from the
                head. Ensure the pedal mechanism is properly lubricated.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'maintenance',
      title: 'Maintenance & Care',
      icon: <Wrench className="h-5 w-5" />,
      content: (
        <div className="space-y-3 text-slate-600">
          <p>
            Well-maintained drums stay in tune longer and produce better sound. Make these
            practices part of your routine.
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>
                <strong className="text-slate-700">Cover the heads</strong> when not in use
                to protect from dust and accidental damage.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>
                <strong className="text-slate-700">Avoid extreme temperatures</strong> —
                both heat and cold affect head tension. Let drums acclimate before tuning in
                a new venue.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>
                <strong className="text-slate-700">Clean the head</strong> with a soft damp
                cloth. Never use solvents. Wipe in a spiral from the center outward.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>
                <strong className="text-slate-700">Lubricate the pedal</strong> mechanism
                periodically with the manufacturer-recommended lubricant.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>
                <strong className="text-slate-700">Release pedal tension</strong> when
                storing drums for extended periods to preserve head elasticity.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>
                <strong className="text-slate-700">Inspect tension rods</strong> regularly
                for rust or looseness. Replace damaged rods immediately.
              </span>
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Progress note */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-center text-white shadow-xl">
        <BookOpen className="mx-auto mb-2 h-8 w-8 text-amber-400" />
        <h2 className="text-xl font-bold">Timpani Tuning Tutorial</h2>
        <p className="mt-1 text-sm text-white/50">
          A complete guide from head clearing to performance-ready tuning
        </p>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const isOpen = openSection === section.id;
        return (
          <div
            key={section.id}
            className="overflow-hidden rounded-2xl bg-white shadow-lg"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="flex w-full items-center gap-3 p-5 text-left transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                {section.icon}
              </div>
              <h3 className="flex-1 font-semibold text-slate-800">{section.title}</h3>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </button>
            {isOpen && (
              <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                {section.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
