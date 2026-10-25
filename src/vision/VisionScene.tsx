import {
  useEffect, useId, useRef, useState,
  type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent,
} from 'react'
import * as THREE from 'three'
import type { Condition } from '../lib/content'
import { prefersReducedMotion } from '../lib/motion'
import { SceneAudio } from './audio'
import { buildScene, disposeScene } from './scenes'

interface Props {
  condition: Condition
  intensity: number
}

type Sight = 'flou' | 'tunnel' | 'dmla'
type Move = 'left' | 'forward' | 'back' | 'right'

const sightLabels: Record<Sight, string> = { flou: 'Vision floue', tunnel: 'Tunnel (glaucome)', dmla: 'Tache centrale (DMLA)' }
const RADIUS = 0.35
const MESSAGE_MS = 4500

export default function VisionScene({ condition, intensity }: Props) {
  const kind = condition.vision_kind!
  const wrapRef = useRef<HTMLDivElement>(null)
  const target = useRef(intensity)
  const audioRef = useRef<SceneAudio | null>(null)
  const moves = useRef(new Set<Move>())
  const compareRef = useRef(false)
  const [webglFailed, setWebglFailed] = useState(false)
  const [caption, setCaption] = useState('')
  const [message, setMessage] = useState('')
  const [soundOn, setSoundOn] = useState(false)
  const [compare, setCompare] = useState(false)
  const [sight, setSight] = useState<Sight>('flou')
  const [pressed, setPressed] = useState<Move | null>(null)
  const [lookOnly, setLookOnly] = useState(false)
  const [reticle, setReticle] = useState(false)
  const descId = useId()
  const audioMode = ({ auditive: 'cafe', autisme: 'gare', tdah: 'bureau', schizophrenie: 'bus' } as const)[kind as 'auditive']
  const hasSound = audioMode !== undefined

  target.current = intensity
  compareRef.current = compare

  useEffect(() => {
    audioRef.current?.setIntensity(compare ? 0 : intensity)
  }, [intensity, compare])

  useEffect(() => {
    const wrap = wrapRef.current!
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    } catch {
      setWebglFailed(true)
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    const canvas = renderer.domElement
    canvas.tabIndex = 0
    canvas.setAttribute('role', 'application')
    canvas.setAttribute('aria-roledescription', 'scène 3D')
    canvas.setAttribute('aria-describedby', descId)
    wrap.appendChild(canvas)

    const built = buildScene(kind)
    canvas.setAttribute('aria-label', built.lookOnly
      ? `Scène : ${condition.scene_title}. Flèches pour regarder autour de vous.`
      : `Scène : ${condition.scene_title}. Flèches ou Z Q S D pour avancer et tourner.`)
    setLookOnly(!!built.lookOnly)
    setReticle(!!built.reticle)
    if (built.canvasFilter) canvas.style.transition = 'none'
    let lastFilter = ''
    const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 200)
    camera.rotation.order = 'YXZ'
    const player = { ...built.start, pitch: built.start.pitch ?? -0.05 }
    let current = target.current
    let lastCaptionKey = ''
    let messageUntil = 0
    let lastMessage = ''

    const say = (text: string) => {
      if (!text) return
      const now = performance.now()
      if (text === lastMessage && now < messageUntil + 2500) return
      lastMessage = text
      messageUntil = now + MESSAGE_MS
      setMessage(text)
    }

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = wrap
      renderer.setSize(w, h, false)
      camera.aspect = w / Math.max(1, h)
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    resize()

    // Clavier : flèches, ZQSD (AZERTY) et WASD.
    const keyMap: Record<string, Move> = {
      ArrowUp: 'forward', KeyW: 'forward', KeyZ: 'forward',
      ArrowDown: 'back', KeyS: 'back',
      ArrowLeft: 'left', KeyA: 'left', KeyQ: 'left',
      ArrowRight: 'right', KeyD: 'right',
    }
    const onKey = (e: KeyboardEvent) => {
      const m = keyMap[e.code]
      if (!m) return
      e.preventDefault()
      if (e.type === 'keydown') moves.current.add(m)
      else moves.current.delete(m)
    }
    canvas.addEventListener('keydown', onKey)
    canvas.addEventListener('keyup', onKey)
    canvas.addEventListener('blur', () => moves.current.clear())

    // Souris et doigt : glisser pour regarder autour de soi.
    let drag: { x: number; y: number } | null = null
    canvas.addEventListener('pointerdown', (e) => {
      drag = { x: e.clientX, y: e.clientY }
      canvas.setPointerCapture(e.pointerId)
      canvas.focus({ preventScroll: true })
    })
    canvas.addEventListener('pointermove', (e) => {
      if (!drag) return
      player.yaw -= (e.clientX - drag.x) * 0.005
      player.pitch = Math.max(-0.9, Math.min(0.6, player.pitch - (e.clientY - drag.y) * 0.004))
      drag = { x: e.clientX, y: e.clientY }
    })
    const endDrag = () => { drag = null }
    canvas.addEventListener('pointerup', endDrag)
    canvas.addEventListener('pointercancel', endDrag)
    canvas.style.touchAction = 'none'
    canvas.focus({ preventScroll: true })

    const collides = (x: number, z: number, i: number) => {
      for (const o of built.obstacles) {
        if (x + RADIUS > o.minX && x - RADIUS < o.maxX && z + RADIUS > o.minZ && z - RADIUS < o.maxZ) {
          if (o.blocks(i)) return o
          say(o.message(i))
        }
      }
      return null
    }

    const reduced = prefersReducedMotion()
    const clock = new THREE.Clock()
    let raf = 0
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, clock.getDelta())
      const t = clock.elapsedTime
      // Le stade évolue en continu sur ≈ 800 ms, sauf si l'on a demandé moins d'animations.
      current = reduced ? target.current : current + (target.current - current) * (1 - Math.exp(-dt / 0.27))
      const i = current

      const m = moves.current
      // Scènes sans déplacement (on regarde, on lit, on écrit avec les yeux) : rotation plus lente et précise.
      const turn = built.lookOnly ? 0.7 : 1.6
      if (m.has('left')) player.yaw += turn * dt
      if (m.has('right')) player.yaw -= turn * dt
      const dir = (m.has('forward') ? 1 : 0) - (m.has('back') ? 1 : 0)
      if (dir && built.lookOnly) {
        player.pitch = Math.max(-0.9, Math.min(0.6, player.pitch + dir * 0.6 * dt))
      } else if (dir) {
        const step = built.speed(i) * dt * dir
        const nx = player.x - Math.sin(player.yaw) * step
        const nz = player.z - Math.cos(player.yaw) * step
        const b = built.bounds
        const hitX = collides(nx, player.z, i)
        if (!hitX) player.x = Math.max(b.minX, Math.min(b.maxX, nx))
        const hitZ = collides(player.x, nz, i)
        if (!hitZ) player.z = Math.max(b.minZ, Math.min(b.maxZ, nz))
        const hit = hitX ?? hitZ
        if (hit) say(hit.message(i))
      }
      for (const zone of built.zones) {
        if (Math.hypot(player.x - zone.x, player.z - zone.z) < zone.r) say(zone.message(i))
      }

      camera.position.set(player.x, built.eyeHeight(i), player.z)
      camera.rotation.set(player.pitch, player.yaw, 0)
      built.update(dt, t, i, camera)
      const notice = built.notice?.(t, i)
      if (notice) say(notice)
      if (built.canvasFilter) {
        const f = built.canvasFilter(t, i)
        if (f !== lastFilter) canvas.style.filter = lastFilter = f
      }

      const cap = built.caption?.(t, compareRef.current ? 0 : i) ?? null
      const key = cap ? `${cap.key}|${cap.text}` : ''
      if (key !== lastCaptionKey) {
        const isNewLine = cap && cap.key !== lastCaptionKey.split('|')[0]
        lastCaptionKey = key
        setCaption(cap?.text ?? '')
        if (isNewLine && cap?.speak) audioRef.current?.voice(cap.speak)
        if (isNewLine && cap?.whisper !== undefined) audioRef.current?.whisper(3.2, cap.whisper)
      }
      if (messageUntil && performance.now() > messageUntil) {
        messageUntil = 0
        setMessage('')
      }
      renderer.render(built.scene, camera)
    }
    frame()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      disposeScene(built.scene)
      renderer.dispose()
      canvas.remove()
      audioRef.current?.stop()
      audioRef.current = null
    }
  }, [kind, condition.scene_title, descId])

  const toggleSound = () => {
    if (soundOn) {
      audioRef.current?.stop()
      audioRef.current = null
      setSoundOn(false)
      return
    }
    const audio = new SceneAudio(audioMode!)
    audio.setIntensity(compare ? 0 : intensity)
    audio.start()
    audioRef.current = audio
    setSoundOn(true)
  }

  const hold = (m: Move) => ({
    onPointerDown: (e: ReactPointerEvent) => { e.preventDefault(); moves.current.add(m); setPressed(m) },
    onPointerUp: () => { moves.current.delete(m); setPressed(null) },
    onPointerLeave: () => { moves.current.delete(m); setPressed(null) },
    onKeyDown: (e: ReactKeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); moves.current.add(m); setPressed(m) } },
    onKeyUp: () => { moves.current.delete(m); setPressed(null) },
    'aria-pressed': pressed === m,
  })

  // Effets de vision : appliqués en CSS, avec une transition de 800 ms entre stades.
  const i = intensity
  const canvasFilter =
    kind === 'visuelle'
      ? `blur(${sight === 'flou' ? 2 + 14 * i : sight === 'dmla' ? 1 + 3 * i : 1.5 * i}px)`
      : kind === 'autisme'
        ? `saturate(${1 + 0.8 * i}) contrast(${1 + 0.25 * i}) brightness(${1 + 0.12 * i})`
        : 'none'

  if (webglFailed) {
    return (
      <div className="vision-center">
        <div className="end-card">
          <p className="overtitle">Scène indisponible sur cet appareil</p>
          <p className="lead">{condition.scene_description}</p>
          <p className="muted">Une vidéo 360° de secours sera proposée sur les appareils sans WebGL.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="vision-stage">
      <div ref={wrapRef} className="vision-canvas-wrap" style={{ '--canvas-filter': canvasFilter } as CSSProperties} />

      {kind === 'visuelle' && (
        <div className="sight" aria-hidden="true">
          <div className="sight-tunnel" style={{
            width: `${sight === 'tunnel' ? 120 - 105 * i : 260}vmax`, height: `${sight === 'tunnel' ? 120 - 105 * i : 260}vmax`,
            opacity: sight === 'tunnel' ? 1 : 0,
          }} />
          <div className="sight-spot" style={{
            width: `${sight === 'dmla' ? 20 + 90 * i : 0}vmin`, height: `${sight === 'dmla' ? 20 + 90 * i : 0}vmin`,
            opacity: sight === 'dmla' ? 1 : 0,
          }} />
          <div className="sight-dark" style={{ opacity: i > 0.9 ? 0.96 : 0 }} />
        </div>
      )}
      {kind === 'autisme' && (
        <div className="sight" aria-hidden="true"><div className="sight-overload" style={{ opacity: i }} /></div>
      )}

      {reticle && <div className="reticle" aria-hidden="true" />}

      <p id={descId} className="visually-hidden">{condition.scene_description}</p>

      <div className="vision-bottom">
        <p className="caption" role="status" aria-live="polite" style={{ color: 'var(--ambre)' }}>{message}</p>
        <p className="caption" aria-live="off">{caption}</p>

        <div className="move-pad" role="group" aria-label={lookOnly ? 'Regarder' : 'Se déplacer'}>
          <button type="button" {...hold('left')} aria-label="Tourner à gauche">↺</button>
          <button type="button" {...hold('forward')} aria-label={lookOnly ? 'Regarder plus haut' : 'Avancer'}>{lookOnly ? '↑' : '↑ Avancer'}</button>
          <button type="button" {...hold('back')} aria-label={lookOnly ? 'Regarder plus bas' : 'Reculer'}>↓</button>
          <button type="button" {...hold('right')} aria-label="Tourner à droite">↻</button>
        </div>

        <div className="btn-row" style={{ justifyContent: 'center' }}>
          {hasSound && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={toggleSound} aria-pressed={soundOn}>
              {soundOn ? 'Couper le son' : 'Activer le son'}
            </button>
          )}
          {kind === 'auditive' && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCompare((c) => !c)} aria-pressed={compare}>
              {compare ? 'Revenir au stade choisi' : 'Comparer : audition typique'}
            </button>
          )}
          {kind === 'visuelle' && (
            <fieldset className="radio-row" style={{ justifyContent: 'center' }}>
              <legend className="visually-hidden">Type de vision</legend>
              {(Object.keys(sightLabels) as Sight[]).map((s) => (
                <label key={s} className="stage-option">
                  <input type="radio" name="sight" checked={sight === s} onChange={() => setSight(s)} />
                  <span style={{ background: sight === s ? 'var(--craie)' : 'rgba(21,18,15,0.75)', border: '1px solid var(--ligne-forte)' }}>
                    {sightLabels[s]}
                  </span>
                </label>
              ))}
            </fieldset>
          )}
        </div>
      </div>
    </div>
  )
}
