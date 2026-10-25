// Ambiances sonores synthétisées (aucun fichier à charger) pour les scènes Vision 3D.
// Le son ne démarre jamais sans action du visiteur, et le volume est plafonné.

export type AudioMode = 'cafe' | 'gare' | 'bureau' | 'bus'

const rand = (a: number, b: number) => a + Math.random() * (b - a)

function noiseBuffer(ctx: AudioContext, seconds = 2) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
  const d = buf.getChannelData(0)
  // Bruit rose approché (filtre de Paul Kellet, version courte).
  let b0 = 0, b1 = 0, b2 = 0
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1
    b0 = 0.99765 * b0 + w * 0.099046
    b1 = 0.963 * b1 + w * 0.2965164
    b2 = 0.57 * b2 + w * 1.0526913
    d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2
  }
  return buf
}

export class SceneAudio {
  private ctx: AudioContext | null = null
  private filter!: BiquadFilterNode
  private master!: GainNode
  private bus!: GainNode
  private timers: number[] = []
  private babble: { band: BiquadFilterNode; gain: GainNode }[] = []
  private hum: GainNode | null = null
  private intensity = 0
  private readonly mode: AudioMode

  constructor(mode: AudioMode) {
    this.mode = mode
  }

  start() {
    if (this.ctx) return
    const ctx = new AudioContext()
    this.ctx = ctx
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -18
    limiter.ratio.value = 12
    limiter.connect(ctx.destination)
    this.master = ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(limiter)
    this.filter = ctx.createBiquadFilter()
    this.filter.type = 'lowpass'
    this.filter.frequency.value = 12000
    this.filter.connect(this.master)
    this.bus = ctx.createGain()
    this.bus.connect(this.filter)

    const noise = noiseBuffer(ctx)
    const loop = (gain: number, type: BiquadFilterType, freq: number) => {
      const src = ctx.createBufferSource()
      src.buffer = noise
      src.loop = true
      src.loopStart = rand(0, 1)
      const f = ctx.createBiquadFilter()
      f.type = type
      f.frequency.value = freq
      const g = ctx.createGain()
      g.gain.value = gain
      src.connect(f).connect(g).connect(this.bus)
      src.start()
      return { band: f, gain: g }
    }

    // Fond de salle.
    loop(this.mode === 'gare' ? 0.16 : 0.12, 'lowpass', 700)

    if (this.mode === 'bus') {
      // Moteur du bus : grondement grave et continu.
      loop(0.35, 'lowpass', 160)
      const hum = ctx.createOscillator()
      hum.frequency.value = 52
      const g = ctx.createGain()
      g.gain.value = 0.05
      hum.connect(g).connect(this.bus)
      hum.start()
      this.setIntensity(this.intensity)
      return
    }

    if (this.mode === 'bureau') {
      // Open space : clavier, conversations lointaines, notifications de plus en plus fréquentes.
      this.randomly(90, 260, () => this.click())
      this.randomly(1500, 6000, () => { if (Math.random() < 0.15 + 0.85 * this.intensity) this.ping(rand(880, 1320), 0.08, 0.5) })
      this.randomly(4000, 9000, () => this.voice(rand(1.5, 3), rand(110, 200)))
      this.setIntensity(this.intensity)
      return
    }

    // Brouhaha : bruits filtrés dont la bande et le volume bougent au rythme des syllabes.
    const voices = this.mode === 'cafe' ? 5 : 8
    for (let i = 0; i < voices; i++) {
      const v = loop(0, 'bandpass', rand(400, 2200))
      v.band.Q.value = 4
      this.babble.push(v)
    }
    this.every(130, () => {
      const t = ctx.currentTime
      const active = this.mode === 'cafe' ? this.babble.length : Math.round(2 + this.intensity * (this.babble.length - 2))
      this.babble.forEach((v, i) => {
        const on = i < active && Math.random() < 0.6
        v.gain.gain.setTargetAtTime(on ? rand(0.04, 0.11) : 0, t, 0.04)
        v.band.frequency.setTargetAtTime(rand(350, 2600), t, 0.06)
      })
    })

    if (this.mode === 'cafe') {
      // Tasses et cuillères.
      this.randomly(1200, 3800, () => this.ping(rand(2600, 4200), 0.05, 0.35))
    } else {
      // Néon qui grésille et valises qui roulent : de plus en plus présents avec le niveau.
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = 100
      const lp = ctx.createBiquadFilter()
      lp.frequency.value = 500
      this.hum = ctx.createGain()
      this.hum.gain.value = 0
      osc.connect(lp).connect(this.hum).connect(this.bus)
      osc.start()
      const wheels = loop(0, 'bandpass', 220)
      this.every(400, () => wheels.gain.gain.setTargetAtTime(Math.random() < 0.5 ? 0.12 * this.intensity : 0, ctx.currentTime, 0.15))
      // Annonces en gare : carillon puis voix.
      this.every(9000, () => this.announce())
      this.announce()
    }
    this.setIntensity(this.intensity)
  }

  /** i : 0 (audition typique / calme) à 1 (stade maximal). Transition ≈ 800 ms. */
  setIntensity(i: number) {
    this.intensity = i
    if (!this.ctx) return
    const t = this.ctx.currentTime
    if (this.mode === 'cafe') {
      // De 12 kHz à 250 Hz : les consonnes disparaissent d'abord, puis tout s'étouffe.
      const cutoff = 12000 * Math.pow(250 / 12000, i)
      this.filter.frequency.setTargetAtTime(cutoff, t, 0.25)
      this.master.gain.setTargetAtTime(0.9 - 0.82 * i, t, 0.25)
    } else if (this.mode === 'bus') {
      this.filter.frequency.setTargetAtTime(12000, t, 0.25)
      this.master.gain.setTargetAtTime(0.55, t, 0.25)
    } else if (this.mode === 'bureau') {
      this.filter.frequency.setTargetAtTime(12000, t, 0.25)
      this.master.gain.setTargetAtTime(0.35 + 0.35 * i, t, 0.25)
    } else {
      this.filter.frequency.setTargetAtTime(12000, t, 0.25)
      this.master.gain.setTargetAtTime(0.3 + 0.45 * i, t, 0.25)
      this.hum?.gain.setTargetAtTime(0.01 + 0.07 * i, t, 0.25)
    }
  }

  /** Voix synthétique (formants) qui « parle » pendant `seconds`. */
  voice(seconds: number, pitch = 135) {
    const ctx = this.ctx
    if (!ctx) return
    const t0 = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = pitch
    const f1 = ctx.createBiquadFilter()
    const f2 = ctx.createBiquadFilter()
    f1.type = f2.type = 'bandpass'
    f1.Q.value = f2.Q.value = 7
    const g = ctx.createGain()
    g.gain.value = 0
    osc.connect(f1).connect(g)
    osc.connect(f2).connect(g)
    g.connect(this.bus)
    for (let t = 0; t < seconds; t += rand(0.12, 0.24)) {
      const at = t0 + t
      g.gain.setTargetAtTime(Math.random() < 0.8 ? 0.5 : 0, at, 0.02)
      f1.frequency.setTargetAtTime(rand(300, 800), at, 0.03)
      f2.frequency.setTargetAtTime(rand(900, 2300), at, 0.03)
      osc.frequency.setTargetAtTime(pitch * rand(0.9, 1.15), at, 0.05)
    }
    g.gain.setTargetAtTime(0, t0 + seconds, 0.05)
    osc.start(t0)
    osc.stop(t0 + seconds + 0.5)
  }

  /** Chuchotement : souffle sans voix, découpé en syllabes, placé à gauche ou à droite. */
  whisper(seconds: number, pan: number) {
    const ctx = this.ctx
    if (!ctx) return
    const t0 = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = noiseBuffer(ctx, 1)
    src.loop = true
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.Q.value = 3
    const g = ctx.createGain()
    g.gain.value = 0
    const panner = ctx.createStereoPanner()
    panner.pan.value = pan
    src.connect(band).connect(g).connect(panner).connect(this.bus)
    // Proche et net en phase aiguë, lointain et faible une fois la maladie stabilisée.
    const peak = 0.12 + 0.5 * this.intensity
    for (let t = 0; t < seconds; t += rand(0.1, 0.22)) {
      const at = t0 + t
      g.gain.setTargetAtTime(Math.random() < 0.75 ? peak : 0, at, 0.02)
      band.frequency.setTargetAtTime(rand(1800, 4200), at, 0.03)
    }
    g.gain.setTargetAtTime(0, t0 + seconds, 0.05)
    src.start(t0)
    src.stop(t0 + seconds + 0.5)
  }

  stop() {
    this.timers.forEach((id) => window.clearInterval(id))
    this.timers = []
    void this.ctx?.close()
    this.ctx = null
    this.babble = []
  }

  private announce() {
    if (!this.ctx) return
    this.ping(660, 0.12, 0.9)
    window.setTimeout(() => this.ping(550, 0.12, 1.1), 450)
    window.setTimeout(() => this.voice(3.2, 180), 1300)
    if (this.intensity > 0.6) window.setTimeout(() => this.voice(2.5, 120), 2600)
  }

  private click() {
    const ctx = this.ctx
    if (!ctx) return
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    o.type = 'square'
    o.frequency.value = rand(1800, 2600)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.015, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03)
    o.connect(g).connect(this.bus)
    o.start(t)
    o.stop(t + 0.04)
  }

  private ping(freq: number, peak: number, decay: number) {
    const ctx = this.ctx
    if (!ctx) return
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    o.frequency.value = freq
    const g = ctx.createGain()
    g.gain.setValueAtTime(peak, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay)
    o.connect(g).connect(this.bus)
    o.start(t)
    o.stop(t + decay)
  }

  private every(ms: number, fn: () => void) {
    this.timers.push(window.setInterval(fn, ms))
  }

  private randomly(min: number, max: number, fn: () => void) {
    const tick = () => {
      if (!this.ctx) return
      fn()
      this.timers.push(window.setTimeout(tick, rand(min, max)))
    }
    this.timers.push(window.setTimeout(tick, rand(min, max)))
  }
}
