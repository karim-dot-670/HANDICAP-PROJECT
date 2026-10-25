import * as THREE from 'three'

// Scènes Vision 3D en géométrie procédurale : rien à télécharger, chargement instantané.
// Chaque scène reçoit l'intensité du stade (0 → 1) déjà lissée sur ≈ 800 ms.

export interface Obstacle {
  minX: number; maxX: number; minZ: number; maxZ: number
  blocks: (i: number) => boolean
  message: (i: number) => string
}

export interface Zone {
  x: number; z: number; r: number
  message: (i: number) => string
}

export interface Caption {
  key: string
  text: string
  /** Durée d'une voix synthétique à jouer avec la réplique (secondes). */
  speak?: number
  /** Chuchotement spatialisé : -1 (gauche) à 1 (droite). */
  whisper?: number
}

export interface BuiltScene {
  scene: THREE.Scene
  start: { x: number; z: number; yaw: number; pitch?: number }
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
  obstacles: Obstacle[]
  zones: Zone[]
  eyeHeight: (i: number) => number
  speed: (i: number) => number
  update: (dt: number, t: number, i: number, camera: THREE.Camera) => void
  caption?: (t: number, i: number) => Caption | null
  /** Pas de déplacement : flèches haut/bas pour lever ou baisser les yeux. */
  lookOnly?: boolean
  /** Point de visée au centre de l'écran (regard). */
  reticle?: boolean
  /** Filtre CSS calculé à chaque image (flou passager, fatigue…). */
  canvasFilter?: (t: number, i: number) => string
  /** Message ponctuel décidé par la scène (affiché comme ceux des zones). */
  notice?: (t: number, i: number) => string | null
}

// ——— Outils ———

export const mat = (color: THREE.ColorRepresentation, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra })

export function box(parent: THREE.Object3D, w: number, h: number, d: number, color: THREE.ColorRepresentation,
  x: number, y: number, z: number, extra?: THREE.MeshStandardMaterialParameters) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, extra))
  m.position.set(x, y + h / 2, z)
  parent.add(m)
  return m
}

export const skin = ['#8d5a3b', '#c68863', '#e0b48f', '#5c3a26', '#a8714e']
export const cloth = ['#3e5c76', '#7a3b3b', '#556b2f', '#8a6d3b', '#4b3f72', '#2f4f4f', '#9c5b2e', '#6b6b6b']
export const pick = <T,>(arr: T[], n: number) => arr[Math.abs(Math.floor(n)) % arr.length]

export function person(parent: THREE.Object3D, x: number, z: number, seed: number, height = 1.72) {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, height - 0.75, 4, 10), mat(pick(cloth, seed * 7)))
  body.position.y = (height - 0.3) / 2 + 0.05
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), mat(pick(skin, seed * 3)))
  head.position.y = height - 0.15
  g.add(body, head)
  g.position.set(x, 0, z)
  parent.add(g)
  return { group: g, head }
}

export function label(text: string, w: number, h: number, opts: { bg?: string; fg?: string; font?: string; emissive?: boolean } = {}) {
  const scale = 256
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  const c = canvas.getContext('2d')!
  c.fillStyle = opts.bg ?? '#f4efe8'
  c.fillRect(0, 0, canvas.width, canvas.height)
  c.fillStyle = opts.fg ?? '#15120f'
  c.font = opts.font ?? `600 ${Math.round(canvas.height * 0.5)}px Barlow, sans-serif`
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  const lines = text.split('\n')
  lines.forEach((line, n) => c.fillText(line, canvas.width / 2, (canvas.height * (n + 0.5)) / lines.length))
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const material = opts.emissive
    ? new THREE.MeshBasicMaterial({ map: tex })
    : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), material)
}

export const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// Hachage déterministe : un mot masqué le reste quand le stade augmente.
export const hash = (s: string) => {
  let h = 2166136261
  for (let k = 0; k < s.length; k++) h = Math.imul(h ^ s.charCodeAt(k), 16777619)
  return ((h >>> 0) % 1000) / 1000
}

export function room(scene: THREE.Scene, w: number, d: number, h: number, floor: string, wall: string, ceiling: string) {
  box(scene, w, 0.1, d, floor, 0, -0.1, 0)
  box(scene, w, 0.1, d, ceiling, 0, h, 0)
  box(scene, w, h, 0.2, wall, 0, 0, -d / 2)
  box(scene, w, h, 0.2, wall, 0, 0, d / 2)
  box(scene, 0.2, h, d, wall, -w / 2, 0, 0)
  box(scene, 0.2, h, d, wall, w / 2, 0, 0)
}

