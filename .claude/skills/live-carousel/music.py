# Original beat-locked music for a live carousel, synthesised with numpy (royalty-free, no downloads).
# Usage: python3 music.py OUT_DIR BPM BARS_PER_SLIDE[,..] [calm|bright] [seed]
# Writes slide01.wav, slide02.wav, ... Each slide plays the next part of one song and loops cleanly:
# it covers whole bars of the same chord loop, and notes ringing past the end wrap round to the start.
import numpy as np, sys, wave, os

SR = 44100
PROG = {"calm": [(57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)],     # Am F C G
        "bright": [(48, 52, 55), (55, 59, 62), (57, 60, 64), (53, 57, 60)]}   # C G Am F
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

def tone(f, dur, kind):
    t = np.arange(int(SR * dur)) / SR
    if kind == "pad":
        x = sum(np.sin(2 * np.pi * f * d * t) for d in (1, 1.003, 0.997)) / 3
        return x * np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.4 + 0.05)
    if kind == "pluck":
        return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 7)
    if kind == "bass":
        return np.sin(2 * np.pi * f * t) * np.exp(-t * 2.5)
    if kind == "kick":
        return np.sin(2 * np.pi * (50 + 90 * np.exp(-t * 30)) * t) * np.exp(-t * 9)
    if kind == "hat":
        return np.random.default_rng(1).uniform(-1, 1, len(t)) * np.exp(-t * 60)

def slide(index, total, bars, bpm, style, start_bar):
    beat = 60 / bpm
    n = int(round(SR * bars * 4 * beat))
    buf = np.zeros(n)
    def add(x, at):  # circular add so the loop point is seamless
        s = int(round(at * SR)) % n
        idx = (np.arange(len(x)) + s) % n
        np.add.at(buf, idx, x)
    prog = PROG[style]
    drums = 0 < index < total - 1          # intro and outro without drums, so the song has a shape
    for b in range(bars):
        chord = prog[(start_bar + b) % len(prog)]
        t0 = b * 4 * beat
        for m in chord: add(tone(hz(m), 4 * beat, "pad") * 0.10, t0)
        add(tone(hz(chord[0] - 24), 2 * beat, "bass") * 0.35, t0)
        add(tone(hz(chord[0] - 24), 2 * beat, "bass") * 0.25, t0 + 2 * beat)
        for k in range(8):
            add(tone(hz(chord[k % 3] + 12 * (k // 4)), beat, "pluck") * 0.12, t0 + k * beat / 2)
        if drums:
            for k in range(4):
                add(tone(0, 0.4, "kick") * (0.5 if k % 2 == 0 else 0.3), t0 + k * beat)
                add(tone(0, 0.08, "hat") * 0.06, t0 + k * beat + beat / 2)
    return buf

def main(out, bpm, bars, style="calm", seed=0):
    os.makedirs(out, exist_ok=True)
    start = 0
    peak = 0
    parts = []
    for i, b in enumerate(bars):
        parts.append(slide(i, len(bars), b, bpm, style, start))
        start += b
        peak = max(peak, np.max(np.abs(parts[-1])))
    for i, x in enumerate(parts):
        pcm = (x / (peak + 1e-9) * 0.8 * 32767).astype(np.int16)
        with wave.open(os.path.join(out, f"slide{i + 1:02d}.wav"), "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print(out, bpm, "bpm", bars)

if __name__ == "__main__":
    bars = [int(x) for x in sys.argv[3].split(",")]
    main(sys.argv[1], float(sys.argv[2]), bars, sys.argv[4] if len(sys.argv) > 4 else "calm")
