import * as THREE from 'three'
import type { VisionKind } from '../lib/content'
import { mat, box, cloth, pick, person, label, smooth, hash, room, type BuiltScene } from './helpers'
import { alzheimer, deficienceIntellectuelle, dys, epilepsie, parkinson, schizophrenie, sep, sla, tdah } from './scenes-more'

export type { BuiltScene } from './helpers'
// ——— Déficience auditive : un café bondé ———

const cafeLines = [
  'Bonjour ! Qu’est-ce que je vous sers ?',
  'Sur place ou à emporter ?',
  'Vous voulez un verre d’eau avec ?',
  'Ça fera quatre euros vingt, s’il vous plaît.',
  'Désolé, la carte bleue, c’est à partir de cinq euros.',
  'Je vous l’apporte à table, installez-vous.',
]

function cafe(): BuiltScene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#1c140e')
  scene.fog = new THREE.Fog('#1c140e', 8, 22)
  room(scene, 14, 14, 3.4, '#5a3d28', '#4a3324', '#2a1f17')
  scene.add(new THREE.HemisphereLight('#ffe6c8', '#3a2414', 0.9))

  for (const [x, z] of [[-3, -1], [3, -1], [0, 3], [-4, 4], [4, 4]]) {
    const light = new THREE.PointLight('#ffc890', 5, 9, 1.4)
    light.position.set(x, 2.9, z)
    scene.add(light)
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffd9a0' }))
    bulb.position.copy(light.position)
    scene.add(bulb)
  }

  // Comptoir, machine à espresso, ardoise.
  box(scene, 6, 1.05, 0.8, '#4e3324', 0, 0, -2)
  box(scene, 6.1, 0.06, 0.9, '#9c8a74', 0, 1.05, -2)
  box(scene, 6, 0.9, 0.6, '#3a2a1f', 0, 0, -4.2)
  box(scene, 1, 0.55, 0.5, '#9a9a9a', -1.2, 0.9, -4.2, { metalness: 0.7, roughness: 0.3 })
  const menu = label('CAFÉ 1,80 € · CRÈME 3,20 €\nTHÉ 2,50 € · CROISSANT 1,30 €', 3.2, 1, { bg: '#1e2420', fg: '#f4efe8' })
  menu.position.set(1, 2.3, -6.85)
  scene.add(menu)
  box(scene, 0.09, 0.1, 0.09, '#f4efe8', -0.4, 1.1, -2.1)

  // Le serveur, qui parle en tournant la tête.
  const barista = person(scene, 0.4, -3.1, 2, 1.78)
  const apron = box(barista.group, 0.46, 0.7, 0.05, '#1f1a15', 0, 0.55, 0.2)
  apron.position.z = 0.21

  // Tables occupées.
  const heads: THREE.Mesh[] = []
  const tables: [number, number][] = [[-4, 1.5], [-4.5, 4.5], [0.5, 3.5], [4, 1.8], [4.5, 5], [-1.5, 5.5]]
  tables.forEach(([x, z], n) => {
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.05, 20), mat('#c8b49a'))
    top.position.set(x, 0.75, z)
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.75, 8), mat('#2a1f17'))
    leg.position.set(x, 0.37, z)
    scene.add(top, leg)
    heads.push(person(scene, x - 0.65, z, n * 2 + 1, 1.3).head, person(scene, x + 0.65, z, n * 2 + 4, 1.3).head)
  })

  return {
    scene,
    start: { x: 0, z: -0.9, yaw: 0 },
    bounds: { minX: -6.5, maxX: 6.5, minZ: -1.3, maxZ: 6.5 },
    obstacles: [],
    zones: [],
    eyeHeight: () => 1.22,
    speed: () => 1.1,
    update(_dt, t) {
      barista.group.rotation.y = -0.6 + Math.sin(t * 0.4) * 0.5
      barista.head.position.y = 1.63 + Math.abs(Math.sin(t * 9)) * 0.008
      heads.forEach((h, n) => { h.position.x = Math.sin(t * 1.3 + n) * 0.03 })
    },
    caption(t, i) {
      const n = Math.floor(t / 5.5) % cafeLines.length
      if (t % 5.5 > 4.2) return null
      const line = cafeLines[n]
      const key = `${n}-${Math.floor(t / 5.5)}`
      if (i > 0.93) return { key, text: '[Ses lèvres bougent. Aucun son ne vous parvient.]', speak: 3.5 }
      // Les mots disparaissent selon le stade, toujours les mêmes pour un stade donné.
      const p = Math.max(0, (i - 0.08) * 1.05)
      const words = line.split(' ').map((w, k) => (hash(`${n}:${k}`) < p ? '…' : w))
      return { key, text: `Serveur : ${words.join(' ')}`, speak: 3.5 }
    },
  }
}

// ——— Handicap moteur : une rue à hauteur de fauteuil ———

function street(): BuiltScene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#8a7a68')
  scene.fog = new THREE.Fog('#8a7a68', 25, 70)
  scene.add(new THREE.HemisphereLight('#ffe9cf', '#4a3a2c', 1.6))
  const sun = new THREE.DirectionalLight('#ffd7a8', 2.2)
  sun.position.set(10, 20, 5)
  scene.add(sun)

  box(scene, 4.2, 0.15, 70, '#8f877c', -2, -0.15, -25) // trottoir
  box(scene, 8, 0.1, 70, '#34312f', 4, -0.25, -25) // chaussée, 15 cm plus bas
  box(scene, 3, 0.15, 70, '#8f877c', 9.5, -0.15, -25)
  for (let z = -60; z < 8; z += 1.2) box(scene, 4.15, 0.005, 0.02, '#77706a', -2, 0, z)
  for (let k = 0; k < 6; k++) box(scene, 0.5, 0.01, 3, '#e8e2d8', 1 + k * 1.2, -0.15, -40) // passage piéton

  // Façades.
  const colors = ['#b07a52', '#c9a27e', '#8e5f45', '#d1b08c', '#a3684a']
  for (let z = 4, k = 0; z > -62; k++) {
    const len = 6 + (k % 3) * 2
    box(scene, 4, 7 + (k % 2) * 3, len, colors[k % colors.length], -6.1, 0, z - len / 2)
    z -= len
  }

  const shop = (z: number, name: string, bg: string) => {
    const sign = label(name, 3, 0.6, { bg, fg: '#f4efe8' })
    sign.position.set(-4.08, 3, z)
    sign.rotation.y = Math.PI / 2
    scene.add(sign)
    box(scene, 0.08, 2.3, 1.3, '#2a231c', -4.1, 0.12, z) // porte
    box(scene, 0.06, 1.6, 2.2, '#c8dde0', -4.08, 0.6, z + 2, { emissive: '#3a4a50', roughness: 0.2 }) // vitrine
  }
  shop(-12, 'BOULANGERIE', '#8a3b2e')
  box(scene, 0.7, 0.13, 1.6, '#a39b90', -3.75, 0, -12) // la marche
  shop(-30, '✚ PHARMACIE', '#2e7a4a')

  // Trottinette en travers du trottoir.
  box(scene, 2.9, 0.08, 0.2, '#1f6b6b', -2.05, 0.06, -20)
  box(scene, 0.06, 1, 0.06, '#1f6b6b', -0.8, 0.06, -20)

  for (let z = -6; z > -60; z -= 12) {
    box(scene, 0.12, 4, 0.12, '#2a2a2a', -0.4, 0, z) // lampadaire
    const car = box(scene, 1.8, 1.3, 4.2, pick(cloth, z), 2, -0.2, z - 5)
    car.position.y = 0.45
  }

  // Le fauteuil, visible en baissant les yeux.
  const chair = new THREE.Group()
  const rimMat = mat('#1a1a1a', { metalness: 0.5, roughness: 0.4 })
  for (const x of [-0.33, 0.33]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 8, 32), rimMat)
    rim.rotation.y = Math.PI / 2
    rim.position.set(x, -0.85, 0.15)
    chair.add(rim)
  }
  const knees = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.14, 0.5), mat('#3e4c5e'))
  knees.position.set(0, -0.62, -0.3)
  chair.add(knees)
  scene.add(chair)

  const seated = (i: number) => smooth(0.35, 0.6, i)
  const kerbMessage = 'Le trottoir fait 15 cm de haut. Sans bateau, impossible de descendre sur la chaussée.'

  return {
    scene,
    start: { x: -1.8, z: 3, yaw: 0 },
    bounds: { minX: -3.6, maxX: 10.5, minZ: -58, maxZ: 5 },
    obstacles: [
      { minX: -0.05, maxX: 0.15, minZ: -60, maxZ: 6, blocks: (i) => i > 0.45, message: () => kerbMessage },
      {
        minX: -4.1, maxX: -3.4, minZ: -12.8, maxZ: -11.2, blocks: (i) => i > 0.45,
        message: () => 'Il y a une marche. Je fais demi-tour, ou je demande à un inconnu ?',
      },
      {
        minX: -3.5, maxX: -0.6, minZ: -20.15, maxZ: -19.85, blocks: (i) => i > 0.45,
        message: (i) => i > 0.45
          ? 'Une trottinette en travers du trottoir. Le passage restant fait 55 cm : le fauteuil en fait 70.'
          : 'Une trottinette en travers du trottoir. Il faut l’enjamber avec la canne.',
      },
    ],
    zones: [
      { x: -3.2, z: -30, r: 1.6, message: () => 'La porte de la pharmacie est lourde et s’ouvre vers moi.' },
      { x: -0.6, z: -40, r: 1.8, message: (i) => (i > 0.45 ? 'Pas de bateau pour traverser. Le prochain est 80 m plus loin.' : 'Le passage piéton. Il faut traverser avant que le feu ne change.') },
    ],
    eyeHeight: (i) => 1.62 - 0.47 * seated(i),
    speed: (i) => (i > 0.45 ? 1.4 : 0.8),
    update(_dt, _t, i, camera) {
      chair.position.copy(camera.position)
      chair.rotation.y = (camera as THREE.PerspectiveCamera).rotation.y
      chair.visible = seated(i) > 0.5
    },
  }
}

// ——— Déficience visuelle : un supermarché ———

function supermarket(): BuiltScene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#d9d4cb')
  scene.fog = new THREE.Fog('#d9d4cb', 18, 40)
  room(scene, 12, 44, 4.2, '#c9c2b6', '#e6e0d6', '#f2eee8')
  scene.add(new THREE.HemisphereLight('#ffffff', '#b8b0a2', 2.4))
  for (let z = 18; z > -20; z -= 6) {
    box(scene, 1.2, 0.04, 3, '#ffffff', 0, 4.1, z, { emissive: '#ffffff', emissiveIntensity: 1 })
  }

  // Rayons garnis de produits (une seule géométrie instanciée).
  const product = new THREE.BoxGeometry(0.22, 0.28, 0.22)
  const productMat = new THREE.MeshStandardMaterial({ roughness: 0.6 })
  const count = 2 * 5 * 120
  const products = new THREE.InstancedMesh(product, productMat, count)
  const palette = ['#d64545', '#e8a33d', '#3d8bd6', '#4caf50', '#f2d14b', '#9b59b6', '#f4efe8', '#e2703a']
  const m = new THREE.Matrix4()
  let n = 0
  for (const side of [-1, 1]) {
    box(scene, 0.3, 2.2, 36, '#8a8f96', side * 2.05, 0, 0)
    for (let level = 0; level < 5; level++) {
      box(scene, 0.62, 0.03, 36, '#6b7077', side * 1.75, 0.15 + level * 0.45, 0)
      for (let k = 0; k < 120; k++) {
        m.makeTranslation(side * 1.72, 0.32 + level * 0.45, -17.5 + k * 0.29)
        products.setMatrixAt(n, m)
        products.setColorAt(n, new THREE.Color(palette[(k * 7 + level * 3 + (side > 0 ? 1 : 0)) % palette.length]))
        n++
      }
    }
  }
  scene.add(products)

  const signs: [string, number, string][] = [
    ['FRUITS ET LÉGUMES', 12, '#2e7a4a'], ['PRODUITS LAITIERS', 2, '#3d6bd6'],
    ['SORBETS', -8, '#8a3b2e'], ['SORTIE →', -17, '#15120f'],
  ]
  for (const [text, z, bg] of signs) {
    const s = label(text, 2.6, 0.55, { bg, fg: '#ffffff' })
    s.position.set(0, 3.2, z)
    scene.add(s)
  }
  const prices = ['2,49 €', '0,99 € / kg', '3,15 €', '1,79 €', '4,20 €', '-30 %']
  prices.forEach((p, k) => {
    const tag = label(p, 0.5, 0.18, { bg: '#f2d14b', fg: '#15120f' })
    const side = k % 2 ? 1 : -1
    tag.position.set(side * 1.43, 1.12, 12 - k * 5)
    tag.rotation.y = -side * Math.PI / 2
    scene.add(tag)
  })

  box(scene, 0.6, 0.45, 0.5, '#a07a50', 0.2, 0, 0) // carton au milieu de l'allée

  return {
    scene,
    start: { x: 0, z: 19, yaw: 0 },
    bounds: { minX: -1.1, maxX: 1.1, minZ: -20, maxZ: 20.5 },
    obstacles: [{
      minX: -0.1, maxX: 0.5, minZ: -0.25, maxZ: 0.25, blocks: () => true,
      message: (i) => (i > 0.9 ? 'Ma canne touche un carton laissé au milieu de l’allée.' : 'Un carton au milieu de l’allée. Je ne l’avais pas vu.'),
    }],
    zones: [{ x: 0, z: -5, r: 2, message: () => 'Ce panneau dit « Sortie » ou « Sorbet » ? Je vais suivre la foule.' }],
    eyeHeight: () => 1.65,
    speed: () => 1.2,
    update() {},
  }
}

// ——— Autisme : une gare à l'heure de pointe ———

const announcements = [
  'Le TER 865 à destination de Lyon partira voie 7.',
  'Attention : changement de voie. Le TER 865 partira voie 3.',
  'Le train de 8 h 24 est annoncé avec un retard de 10 minutes.',
  'Pour votre sécurité, ne laissez pas vos bagages sans surveillance.',
]

function station(): BuiltScene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#2a2622')
  scene.fog = new THREE.Fog('#2a2622', 20, 55)
  room(scene, 30, 60, 11, '#8a8278', '#6d655c', '#3a352f')
  const hemi = new THREE.HemisphereLight('#fff8e6', '#4a4038', 1.6)
  scene.add(hemi)

  const neonMat = new THREE.MeshStandardMaterial({ color: '#fffbe8', emissive: '#fffbe8', emissiveIntensity: 1 })
  for (let z = -25; z <= 25; z += 5) {
    for (const x of [-8, 0, 8]) {
      const tube = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 3.5), neonMat)
      tube.position.set(x, 10.5, z)
      scene.add(tube)
    }
    box(scene, 30, 0.4, 0.3, '#2f2c29', 0, 10.6, z + 2.5)
  }
  const board = label('DÉPARTS   8:12 TER LYON  V7   8:24 TGV PARIS  V3   8:31 TER DIJON  V5', 14, 1.4, {
    bg: '#0d1a2b', fg: '#f2b46b', font: '500 90px "IBM Plex Mono", monospace', emissive: true,
  })
  board.position.set(0, 6, -29.8)
  scene.add(board)

  // Foule : de plus en plus nombreuse et pressée avec le niveau.
  const MAX = 70
  const crowd = Array.from({ length: MAX }, (_, k) => {
    const p = person(scene, (Math.random() - 0.5) * 26, (Math.random() - 0.5) * 50, k, 1.6 + Math.random() * 0.25)
    return { ...p, target: new THREE.Vector2((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 50), phase: Math.random() * 6 }
  })

  return {
    scene,
    start: { x: 0, z: 20, yaw: 0 },
    bounds: { minX: -14, maxX: 14, minZ: -28, maxZ: 28 },
    obstacles: [],
    zones: [],
    eyeHeight: () => 1.65,
    speed: () => 1.3,
    update(dt, t, i) {
      // Pulsation lente (≈ 0,7 Hz) : bien en dessous du seuil de 3 flashs par seconde.
      const pulse = 1 + 0.35 * i * Math.sin(t * Math.PI * 1.4)
      neonMat.emissiveIntensity = pulse
      hemi.intensity = 1.6 * pulse
      const visible = Math.round(12 + (MAX - 12) * i)
      const speed = 0.9 + 0.8 * i
      crowd.forEach((c, k) => {
        c.group.visible = k < visible
        if (!c.group.visible) return
        const pos = new THREE.Vector2(c.group.position.x, c.group.position.z)
        const dir = c.target.clone().sub(pos)
        if (dir.length() < 0.5) c.target.set((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 50)
        dir.normalize().multiplyScalar(speed * dt)
        c.group.position.x += dir.x
        c.group.position.z += dir.y
        c.group.rotation.y = Math.atan2(dir.x, dir.y)
        c.group.position.y = Math.abs(Math.sin(t * 6 + c.phase)) * 0.04
      })
    },
    caption(t, i) {
      const n = Math.floor(t / 9) % announcements.length
      const parts = []
      if (t % 9 > 1.3 && t % 9 < 6.5) parts.push(`[Annonce] ${announcements[n]}`)
      if (i > 0.5) parts.push('[Le néon grésille]')
      if (i > 0.8) parts.push('[Valises qui roulent · trop de voix en même temps]')
      if (!parts.length) return null
      return { key: parts.join('|'), text: parts.join('  ·  ') }
    },
  }
}

export function buildScene(kind: VisionKind): BuiltScene {
  switch (kind) {
    case 'auditive': return cafe()
    case 'moteur': return street()
    case 'visuelle': return supermarket()
    case 'autisme': return station()
    case 'dys': return dys()
    case 'tdah': return tdah()
    case 'alzheimer': return alzheimer()
    case 'intellectuelle': return deficienceIntellectuelle()
    case 'epilepsie': return epilepsie()
    case 'parkinson': return parkinson()
    case 'sep': return sep()
    case 'sla': return sla()
    case 'schizophrenie': return schizophrenie()
  }
}

export function disposeScene(scene: THREE.Scene) {
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.geometry.dispose()
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mats.forEach((m) => {
      ;(m as THREE.MeshStandardMaterial).map?.dispose()
      m.dispose()
    })
  })
}
