import * as THREE from 'three'
import { box, cloth, hash, label, mat, person, pick, room, smooth, type BuiltScene } from './helpers'

// Scènes Vision 3D ajoutées après le MVP. Même principe : géométrie procédurale,
// intensité du stade de 0 à 1, aucun flash, aucune variation brusque de lumière.

// ——— Outils propres à ces scènes ———

/** Surface dessinée en 2D (feuille, écran, tablette) et redessinable à la volée. */
function surface(wPx: number, hPx: number, wM: number, hM: number, lit = false) {
  const canvas = document.createElement('canvas')
  canvas.width = wPx
  canvas.height = hPx
  const ctx = canvas.getContext('2d')!
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const material = lit
    ? new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })
    : new THREE.MeshBasicMaterial({ map: tex })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wM, hM), material)
  return { canvas, ctx, tex, mesh }
}

/** Découpe un texte en lignes qui tiennent dans `maxW` pixels. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const out: string[] = []
  for (const para of text.split('\n')) {
    let line = ''
    for (const word of para.split(' ')) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxW && line) {
        out.push(line)
        line = word
      } else line = test
    }
    out.push(line)
  }
  return out
}

function lights(scene: THREE.Scene, sky: string, ground: string, intensity: number) {
  scene.add(new THREE.HemisphereLight(sky, ground, intensity))
  const sun = new THREE.DirectionalLight('#fff1dc', 1.2)
  sun.position.set(3, 6, 4)
  scene.add(sun)
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// ——— Troubles DYS : un contrôle de français ———

const consigne =
  'Lis attentivement le texte, puis réponds aux questions. Souligne les verbes conjugués au passé composé ' +
  'et entoure les mots qui commencent par b, d, p ou q.\n\nLe petit bateau bleu a dépassé le quai. ' +
  'Le pêcheur a déplié ses dix paniers de pommes, puis il a pris le bus pour rentrer dîner. ' +
  'Pendant ce temps, sa fille a bu un bol de lait près du poêle.\n\n1. Qui a pris le bus ?\n2. Combien de paniers ?'
const mirror: Record<string, string> = { b: 'd', d: 'b', p: 'q', q: 'p', n: 'u', u: 'n', m: 'w', w: 'm' }

export function dys(): BuiltScene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#2a2420')
  room(scene, 9, 9, 3, '#7a6a58', '#c9bba6', '#e8e0d4')
  lights(scene, '#fff6e6', '#5a4a3a', 1.5)

  box(scene, 1.2, 0.72, 0.7, '#9c7a52', 0, 0, -0.75)
  const board = label('CONTRÔLE DE FRANÇAIS — 20 MIN', 3.6, 0.5, { bg: '#24402f', fg: '#f4efe8' })
  board.position.set(0, 2.1, -4.35)
  scene.add(board)
  const teacher = person(scene, 1.6, -3.8, 5)
  for (const [x, z] of [[-1.6, -2.2], [1.6, -2.2], [-1.6, -3.4], [0, -2.2]]) {
    box(scene, 1, 0.72, 0.6, '#9c7a52', x, 0, z - 0.6)
    person(scene, x, z, x * 3 + z, 1.3)
  }

  const sheet = surface(900, 1200, 0.42, 0.56, true)
  sheet.mesh.position.set(0, 0.93, -0.66)
  sheet.mesh.rotation.x = -0.55
  scene.add(sheet.mesh)

  // Mise en page figée une fois pour toutes : seules les lettres bougent ensuite.
  const { ctx } = sheet
  const font = '400 34px Barlow, sans-serif'
  ctx.font = font
  const glyphs: { ch: string; x: number; y: number }[] = []
  wrap(ctx, consigne, 800).forEach((line, row) => {
    let x = 50
    for (const ch of line) {
      glyphs.push({ ch, x, y: 170 + row * 52 })
      x += ctx.measureText(ch).width
    }
  })

  let lastKey = ''
  const draw = (tick: number, i: number) => {
    ctx.fillStyle = '#f7f3ea'
    ctx.fillRect(0, 0, 900, 1200)
    ctx.fillStyle = '#15120f'
    ctx.font = '700 44px Barlow, sans-serif'
    ctx.fillText('Consigne', 50, 90)
    ctx.font = font
    const p = 0.02 + 0.28 * i
    glyphs.forEach((g, k) => {
      let ch = g.ch
      let dx = 0
      let dy = 0
      // Les lettres miroirs s'inversent, d'autres glissent ou échangent leur place.
      if (mirror[ch] && hash(`m${k}:${Math.floor(tick / 3)}`) < p * 1.8) ch = mirror[ch]
      const r = hash(`${k}:${tick}`)
      if (r < p) {
        dx = (hash(`x${k}:${tick}`) - 0.5) * 26 * i
        dy = (hash(`y${k}:${tick}`) - 0.5) * 16 * i
      }
      const next = glyphs[k + 1]
      if (r < p * 0.4 && next && next.y === g.y && /\p{L}/u.test(next.ch)) ch = next.ch
      ctx.fillText(ch, g.x + dx, g.y + dy)
    })
    sheet.tex.needsUpdate = true
  }

  return {
    scene,
    start: { x: 0, z: 0, yaw: 0, pitch: -0.5 },
    bounds: { minX: -0.2, maxX: 0.2, minZ: -0.1, maxZ: 0.1 },
    obstacles: [],
    zones: [],
    lookOnly: true,
    eyeHeight: () => 1.2,
    speed: () => 0,
    update(_dt, t, i) {
      // Les lettres changent environ 3 fois par seconde : un glissement, pas un clignotement.
      const key = `${Math.floor(t / 0.35)}:${i.toFixed(2)}`
      if (key !== lastKey) {
        lastKey = key
        draw(Math.floor(t / 0.35), i)
      }
      teacher.group.rotation.y = Math.sin(t * 0.3) * 0.6
    },
    caption(t) {
      const lines = ['[L’enseignante] Il reste quinze minutes.', '[Bruit de stylos. Les autres écrivent déjà.]',
        '[L’enseignante] Il reste dix minutes.', '[Un élève rend sa copie.]']
      if (t % 8 > 5) return null
      const n = Math.floor(t / 8) % lines.length
      return { key: String(n), text: lines[n] }
    },
  }
}

// ——— TDAH : finir un mail en open space ———

const mailText =
  'Bonjour Madame Martin,\n\nSuite à notre réunion de mardi, je vous transmets le dossier complet. ' +
  'Vous trouverez en pièce jointe le budget révisé ainsi que le planning de livraison. ' +
  'N’hésitez pas à revenir vers moi si vous avez la moindre question.\n\nBien cordialement,'

interface Distraction { thought: string; popup?: string; phone?: boolean; bird?: boolean; colleague?: boolean }

const distractions: Distraction[] = [
  { popup: 'Messagerie · Karim : tu as vu le match hier ?', thought: 'Tiens, Karim. Je réponds vite fait.' },
  { phone: true, thought: 'Le téléphone vibre. Juste un coup d’œil.' },
  { bird: true, thought: 'Tiens, la fenêtre. Un oiseau.' },
  { popup: 'Rappel : réunion d’équipe dans 5 minutes', thought: 'La réunion ! Ah non, dans cinq minutes.' },
  { colleague: true, thought: '« Quelqu’un veut un café ? » Le café. Le mail. Le café…' },
  { popup: 'Promo : -50 % sur les chaussures de running', thought: 'Des chaussures. Il me faudrait des chaussures.' },
]

export function tdah(): BuiltScene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#d9d2c4')
  room(scene, 14, 10, 3, '#5f5a52', '#d9d2c4', '#ece6dc')
  lights(scene, '#ffffff', '#6a6052', 1.6)

  const windowPane = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.6), new THREE.MeshBasicMaterial({ color: '#bcd4e0' }))
  windowPane.position.set(-6.88, 1.6, -1)
  windowPane.rotation.y = Math.PI / 2
  scene.add(windowPane)
  const bird = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), mat('#2a2a2a'))
  scene.add(bird)

  box(scene, 1.6, 0.74, 0.8, '#8a7a66', 0, 0, -0.85)
  box(scene, 0.08, 0.35, 0.08, '#2a2a2a', 0, 0.74, -1.05)
  const screen = surface(1024, 640, 0.66, 0.41)
  screen.mesh.position.set(0, 1.28, -1.04)
  scene.add(screen.mesh)
  const phone = box(scene, 0.08, 0.012, 0.16, '#15120f', 0.5, 0.74, -0.7)

  for (const [x, z] of [[-3.5, -2.5], [3.5, -2.5], [-3.5, 1.5], [3.5, 1.5]]) {
    box(scene, 1.6, 0.74, 0.8, '#8a7a66', x, 0, z)
    person(scene, x, z + 0.7, x + z * 5, 1.3)
  }
  const colleague = person(scene, 0, -3.2, 3)

  const { ctx } = screen
  let typed = 0
  let focusUntil = 0
  let current: Distraction | null = null
  let distractedUntil = 0
  let nextAt = 5
  let n = 0
  let thought = ''
  let lastDraw = ''

  const draw = (cursor: boolean) => {
    ctx.fillStyle = '#e9edf2'
    ctx.fillRect(0, 0, 1024, 640)
    ctx.fillStyle = '#2b3a4a'
    ctx.fillRect(0, 0, 1024, 70)
    ctx.fillStyle = '#ffffff'
    ctx.font = '500 30px Barlow, sans-serif'
    ctx.fillText('Nouveau message — À : m.martin@entreprise.fr', 30, 46)
    ctx.fillStyle = '#15120f'
    ctx.font = '400 30px Barlow, sans-serif'
    const lines = wrap(ctx, mailText.slice(0, Math.floor(typed)) + (cursor ? '|' : ''), 960)
    lines.forEach((l, k) => ctx.fillText(l, 30, 120 + k * 42))
    if (current?.popup) {
      ctx.fillStyle = '#15120f'
      ctx.fillRect(540, 500, 460, 110)
      ctx.fillStyle = '#f2b46b'
      ctx.font = '500 24px Barlow, sans-serif'
      wrap(ctx, current.popup, 420).forEach((l, k) => ctx.fillText(l, 560, 540 + k * 30))
    }
    screen.tex.needsUpdate = true
  }

  return {
    scene,
    start: { x: 0, z: 0, yaw: 0, pitch: -0.08 },
    bounds: { minX: -6, maxX: 6, minZ: -0.2, maxZ: 4 },
    obstacles: [],
    zones: [],
    eyeHeight: () => 1.22,
    speed: () => 1.1,
    update(dt, t, i) {
      // Les interruptions arrivent plus souvent et durent plus longtemps avec le niveau.
      if (t > nextAt && !current) {
        current = distractions[n++ % distractions.length]
        distractedUntil = t + 2.5 + 3 * i
        thought = current.thought
        nextAt = distractedUntil + lerp(14, 3, i) * (0.7 + hash(String(n)) * 0.6)
      }
      if (current && t > distractedUntil) {
        if (i > 0.6) typed = Math.max(0, typed - 25 * i) // « Où j'en étais ? »
        thought = i > 0.6 ? 'Où j’en étais ? Je relis depuis le début.' : ''
        focusUntil = t + 3
        current = null
      }
      if (!current) {
        if (t > focusUntil) thought = ''
        if (t > focusUntil - 1.5) typed = Math.min(mailText.length, typed + dt * 11)
      }
      phone.rotation.y = current?.phone ? Math.sin(t * 60) * 0.06 : 0
      bird.position.set(-6.7, current?.bird ? 1.8 + Math.sin(t * 2) * 0.3 : -5, -1 + Math.sin(t * 0.9) * 1.6)
      colleague.group.position.x = current?.colleague ? Math.sin(t * 0.8) * 2 : 8
      const key = `${Math.floor(typed)}|${current?.popup ?? ''}|${Math.floor(t * 1.5) % 2}`
      if (key !== lastDraw) {
        lastDraw = key
        draw(Math.floor(t * 1.5) % 2 === 0)
      }
    },
    caption() {
      return thought ? { key: thought, text: thought } : null
    },
  }
}

// ——— Alzheimer : sa propre cuisine ———

export function alzheimer(): BuiltScene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#e8dcc6')
  room(scene, 6, 6, 2.6, '#b9a98f', '#e8dcc6', '#f2ece0')
  lights(scene, '#fff3dc', '#7a6a50', 1.5)

  box(scene, 4.2, 0.9, 0.6, '#8a6a4a', -0.6, 0, -2.65)
  box(scene, 4.3, 0.04, 0.65, '#d9cdb8', -0.6, 0.9, -2.65)
  box(scene, 1.1, 0.75, 1.1, '#9c7a52', 0, 0, 0) // table

  // Placards : les étiquettes deviennent illisibles.
  const words = ['TASSES', 'SUCRE', 'CAFÉ']
  const cupboards = words.map((w, k) => {
    box(scene, 1.3, 0.8, 0.35, '#a3825e', -2 + k * 1.4, 1.5, -2.8)
    const s = surface(320, 100, 0.5, 0.16, true)
    s.mesh.position.set(-2 + k * 1.4, 1.9, -2.62)
    scene.add(s.mesh)
    return { word: w, s }
  })

  // Réfrigérateur et photos de famille dont les visages s'effacent.
  box(scene, 0.8, 1.9, 0.7, '#f0eee8', 2.3, 0, -2.5)
  const faces: THREE.MeshBasicMaterial[] = []
  ;[[2.1, 1.45], [2.45, 1.2], [2.15, 0.95]].forEach(([x, y], k) => {
    const photo = surface(200, 240, 0.2, 0.24)
    const c = photo.ctx
    c.fillStyle = '#d9e4ea'
    c.fillRect(0, 0, 200, 240)
    c.fillStyle = pick(cloth, k * 3)
    c.beginPath()
    c.ellipse(100, 230, 70, 90, 0, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = '#c68863'
    c.beginPath()
    c.arc(100, 95, 45, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = '#15120f'
    c.fillRect(80, 85, 8, 8)
    c.fillRect(112, 85, 8, 8)
    c.fillRect(85, 115, 30, 5)
    photo.mesh.position.set(x, y, -2.14)
    scene.add(photo.mesh)
    const veil = new THREE.MeshBasicMaterial({ color: '#d9cfc0', transparent: true, opacity: 0 })
    const blank = new THREE.Mesh(new THREE.CircleGeometry(0.045, 24), veil)
    blank.position.set(x, y + 0.025, -2.135)
    scene.add(blank)
    faces.push(veil)
  })

  // Objets du quotidien qui changent de place.
  const objects = [
    new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.1, 16), mat('#d64545')), // tasse
    new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.2, 16), mat('#9a9a9a', { metalness: 0.6 })), // bouilloire
    new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.04), mat('#e8c33d', { metalness: 0.8 })), // clés
    new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 8, 16), mat('#15120f')), // lunettes
  ]
  const slots = [
    new THREE.Vector3(-1.8, 0.97, -2.6), new THREE.Vector3(-0.6, 1.0, -2.6), new THREE.Vector3(0.6, 0.94, -2.6),
    new THREE.Vector3(0.2, 0.78, 0.1), new THREE.Vector3(2.3, 1.93, -2.5), new THREE.Vector3(-0.3, 0.78, -0.2),
  ]
  const at = [0, 1, 2, 3]
  objects.forEach((o, k) => { o.position.copy(slots[at[k]]); scene.add(o) })

  const cal = surface(300, 340, 0.4, 0.45, true)
  cal.mesh.position.set(-2.9, 1.5, 0)
  cal.mesh.rotation.y = Math.PI / 2
  scene.add(cal.mesh)
  const days = ['MARDI 14', 'JEUDI 9', 'LUNDI 21', 'DIMANCHE 3']

  let lastLabels = ''
  let swapBucket = 0

  return {
    scene,
    start: { x: 0, z: 2, yaw: 0, pitch: -0.1 },
    bounds: { minX: -2.6, maxX: 2.6, minZ: -2, maxZ: 2.6 },
    obstacles: [{ minX: -0.55, maxX: 0.55, minZ: -0.55, maxZ: 0.55, blocks: () => true, message: () => '' }],
    zones: [
      { x: 2, z: -1.5, r: 1.1, message: (i) => (i > 0.8 ? 'Cette dame sur la photo est gentille. Qui est-ce ?' : 'C’est ma fille, là, sur la photo. Je crois.') },
      { x: -0.6, z: -1.7, r: 1, message: () => 'Où sont mes clés ? Elles étaient là, j’en suis sûr.' },
      { x: -2.2, z: 0, r: 1, message: (i) => (i > 0.5 ? 'Quel jour on est ? Le calendrier dit autre chose que tout à l’heure.' : 'Mardi. Il faut que je pense au rendez-vous.') },
    ],
    eyeHeight: () => 1.62,
    speed: () => 0.9,
    update(dt, t, i) {
      // Toutes les 7 s, deux objets échangent leur place (plus souvent avec le stade).
      const b = Math.floor(t / 7)
      if (b !== swapBucket) {
        swapBucket = b
        if (hash(`s${b}`) < i) {
          const a = Math.floor(hash(`a${b}`) * objects.length)
          const free = slots.map((_, k) => k).filter((k) => !at.includes(k))
          at[a] = free[Math.floor(hash(`f${b}`) * free.length)]
        }
      }
      objects.forEach((o, k) => o.position.lerp(slots[at[k]], 1 - Math.exp(-dt * 1.5)))
      faces.forEach((f, k) => { f.opacity = Math.min(1, i * smooth(0, 1, t / 25 - k * 0.15)) })

      const bucket = Math.floor(t / 4)
      const key = `${bucket}:${i.toFixed(1)}`
      if (key !== lastLabels) {
        lastLabels = key
        cupboards.forEach(({ word, s }, k) => {
          s.ctx.fillStyle = '#f4efe8'
          s.ctx.fillRect(0, 0, 320, 100)
          s.ctx.fillStyle = '#15120f'
          s.ctx.font = '600 56px Barlow, sans-serif'
          s.ctx.textAlign = 'center'
          const shown = [...word].map((ch, n) => {
            const r = hash(`${k}:${n}:${bucket}`)
            return r < i * 0.75 ? 'AEIOUBDRSTXZ'[Math.floor(r * 997) % 12] : ch
          }).join('')
          s.ctx.fillText(shown, 160, 70)
          s.tex.needsUpdate = true
        })
        cal.ctx.fillStyle = '#ffffff'
        cal.ctx.fillRect(0, 0, 300, 340)
        cal.ctx.fillStyle = '#c0392b'
        cal.ctx.fillRect(0, 0, 300, 80)
        cal.ctx.fillStyle = '#ffffff'
        cal.ctx.font = '600 44px Barlow, sans-serif'
        cal.ctx.textAlign = 'center'
        cal.ctx.fillText('OCTOBRE', 150, 56)
        cal.ctx.fillStyle = '#15120f'
        cal.ctx.font = '700 54px Barlow, sans-serif'
        cal.ctx.fillText(i > 0.5 ? days[Math.floor(t / 10) % days.length] : days[0], 150, 220)
        cal.tex.needsUpdate = true
      }
    },
  }
}

// ——— Déficience intellectuelle : un guichet administratif ———

const formText =
  'DEMANDE D’ALLOCATION — CERFA n° 15828*03\n\n1. Situation du demandeur : veuillez préciser la nature de votre ' +
  'hébergement (locataire, propriétaire, hébergé à titre gratuit) ainsi que la date d’effet du bail.\n\n' +
  '2. Ressources : indiquez le montant des ressources perçues au cours des douze derniers mois, hors prestations ' +
  'non imposables.\n\n3. Pièces justificatives : sous réserve d’éligibilité, joindre l’attestation de domiciliation ' +
  'et tout justificatif afférent à votre situation.'

const clerkLines = [
  'Bonjour, c’est pour quoi ? Vous avez rempli le formulaire A ou le B ?',
  'Il me faut le justificatif de domicile de moins de trois mois et l’avis d’imposition N moins un.',
  'La rubrique quatre, vous la laissez vide sauf si vous êtes déjà allocataire, d’accord ?',
  'Vous signez là, là et là, et vous mettez la date en toutes lettres.',
  'Non, ça c’est l’attestation de la CAF, je vous ai demandé le RIB.',
]

export function deficienceIntellectuelle(): BuiltScene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#d8d4cc')
  room(scene, 12, 10, 3, '#a59d90', '#d8d4cc', '#efece6')
  lights(scene, '#ffffff', '#7a7468', 1.6)

  box(scene, 4, 1.1, 0.6, '#6f7d86', 0, 0, -2)
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.1),
    new THREE.MeshStandardMaterial({ color: '#cfe3ea', transparent: true, opacity: 0.18, roughness: 0.1 }))
  glass.position.set(0, 1.75, -2.05)
  scene.add(glass)
  const clerk = person(scene, 0.2, -2.8, 6)
  box(scene, 0.5, 0.35, 0.05, '#15120f', 0.8, 1.1, -2.5) // écran de l'agent
  const sign = label('GUICHET 3', 1.6, 0.4, { bg: '#2b3a4a', fg: '#f4efe8' })
  sign.position.set(0, 2.6, -2.05)
  scene.add(sign)
  const poster = label('Merci de préparer : justificatif de domicile\nde moins de 3 mois, avis d’imposition N-1,\nRIB, pièce d’identité en cours de validité.', 2.4, 0.9, { bg: '#f4efe8', fg: '#15120f', font: '500 52px Barlow, sans-serif' })
  poster.position.set(-3.2, 1.7, -4.88)
  scene.add(poster)
  for (let k = 0; k < 4; k++) person(scene, 0.3 - k * 0.1, 0.6 + k * 0.9, k + 11)

  const form = surface(900, 1200, 0.34, 0.45, true)
  form.mesh.position.set(-0.15, 1.16, -1.82)
  form.mesh.rotation.x = -1.1
  scene.add(form.mesh)

  let lastForm = ''
  let lineT = 0
  let line = 0

  const drawForm = (i: number) => {
    const c = form.ctx
    c.fillStyle = '#ffffff'
    c.fillRect(0, 0, 900, 1200)
    c.font = '400 32px Barlow, sans-serif'
    // Les mots trop longs ou trop abstraits deviennent des blocs : plus le niveau monte, plus il y en a.
    const limit = Math.round(13 - 8 * i)
    wrap(c, formText, 800).forEach((l, row) => {
      let x = 50
      for (const word of l.split(' ')) {
        const bare = word.replace(/[^\p{L}]/gu, '')
        const hidden = bare.length > limit
        c.fillStyle = hidden ? '#9c958a' : '#15120f'
        const shown = hidden ? '▆'.repeat(Math.max(3, Math.round(bare.length * 0.6))) : word
        c.fillText(shown, x, 90 + row * 48)
        x += c.measureText(`${shown} `).width
      }
    })
    form.tex.needsUpdate = true
  }

  return {
    scene,
    start: { x: 0, z: -1.2, yaw: 0, pitch: -0.3 },
    bounds: { minX: -1.8, maxX: 1.8, minZ: -1.4, maxZ: 0 },
    obstacles: [],
    zones: [],
    eyeHeight: () => 1.62,
    speed: () => 0.8,
    update(dt, t, i) {
      const key = i.toFixed(2)
      if (key !== lastForm) { lastForm = key; drawForm(i) }
      // L'agent parle de plus en plus vite, en regardant son écran.
      lineT += dt
      if (lineT > 5.2 - 3.4 * i + 0.6) { lineT = 0; line++ }
      clerk.group.rotation.y = Math.sin(t * 0.5) > 0.2 ? -0.7 : 0
    },
    caption(_t, i) {
      if (lineT > 5.2 - 3.4 * i) return null
      const text = clerkLines[line % clerkLines.length]
      return { key: String(line), text: `Agent : ${text}${i > 0.6 ? '  [Derrière vous, quelqu’un soupire.]' : ''}` }
    },
  }
}

// ——— Épilepsie : le lendemain d'une crise (aucune crise n'est simulée) ———

export function epilepsie(): BuiltScene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#d6cbbb')
  room(scene, 7, 7, 2.6, '#8a7560', '#d6cbbb', '#ece4d8')
  lights(scene, '#fff3dc', '#6a5a48', 1.5)

  box(scene, 1.6, 0.45, 2.1, '#5a6a7a', -2.4, 0, -2.3) // lit défait
  box(scene, 0.9, 0.12, 0.6, '#e8e2d8', -2.4, 0.45, -1.4)
  box(scene, 1, 0.75, 0.8, '#9c7a52', 0.8, 0, -0.5) // table
  const keys = box(scene, 0.09, 0.02, 0.04, '#e8c33d', 0.6, 0.75, -0.4, { metalness: 0.8 })
  keys.rotation.y = 0.4
  const phone = surface(360, 640, 0.07, 0.13)
  const pc = phone.ctx
  pc.fillStyle = '#15120f'
  pc.fillRect(0, 0, 360, 640)
  pc.fillStyle = '#2a231c'
  pc.fillRect(20, 120, 320, 260)
  pc.fillStyle = '#f4efe8'
  pc.font = '500 30px Barlow, sans-serif'
  wrap(pc, 'Léa : Tu vas mieux ? Tu te souviens de ce que tu m’as dit hier ?', 290).forEach((l, k) => pc.fillText(l, 35, 170 + k * 40))
  phone.mesh.rotation.x = -Math.PI / 2
  phone.mesh.position.set(1.05, 0.762, -0.55)
  scene.add(phone.mesh)

  box(scene, 0.8, 1.9, 0.7, '#f0eee8', 2.9, 0, -2.6)
  const notes: [string, number, number][] = [['Neurologue\njeudi 10 h', 2.7, 1.4], ['Médicaments\n8 h / 20 h', 3.05, 1.15]]
  for (const [text, x, y] of notes) {
    const note = label(text, 0.22, 0.22, { bg: '#f2d14b', fg: '#15120f', font: '600 70px Barlow, sans-serif' })
    note.position.set(x, y, -2.24)
    scene.add(note)
  }
  const cal = surface(700, 520, 0.9, 0.67, true)
  const c = cal.ctx
  c.fillStyle = '#ffffff'
  c.fillRect(0, 0, 700, 520)
  c.fillStyle = '#15120f'
  c.font = '700 44px Barlow, sans-serif'
  c.fillText('OCTOBRE', 30, 60)
  c.font = '500 34px Barlow, sans-serif'
  for (let d = 1; d <= 28; d++) {
    const x = 30 + ((d - 1) % 7) * 95
    const y = 140 + Math.floor((d - 1) / 7) * 95
    c.strokeStyle = '#c9bba6'
    c.strokeRect(x, y - 45, 90, 90)
    if (d === 23) {
      c.fillStyle = '#b9afa3'
      c.fillRect(x, y - 45, 90, 90)
      c.fillStyle = '#15120f'
      c.fillText('?', x + 35, y + 10)
    } else c.fillText(String(d), x + 10, y)
  }
  cal.mesh.position.set(0, 1.6, -3.38)
  scene.add(cal.mesh)
  const clock = label('11:40', 0.5, 0.2, { bg: '#15120f', fg: '#f2b46b', font: '500 30px "IBM Plex Mono", monospace' })
  clock.position.set(-1.3, 1.9, -3.38)
  scene.add(clock)

  return {
    scene,
    start: { x: 0, z: 2.5, yaw: 0, pitch: -0.05 },
    bounds: { minX: -3.1, maxX: 3.1, minZ: -2.9, maxZ: 3.1 },
    obstacles: [
      { minX: 0.3, maxX: 1.3, minZ: -0.9, maxZ: -0.1, blocks: () => true, message: () => '' },
      { minX: -3.2, maxX: -1.6, minZ: -3.4, maxZ: -1.2, blocks: () => true, message: () => '' },
    ],
    zones: [
      { x: 0.8, z: 0.2, r: 1.2, message: () => 'Les clés de la voiture. Je n’ai plus le droit de conduire. Comment je vais au travail demain ?' },
      { x: 0, z: -2.5, r: 1, message: () => 'Hier, c’était quoi déjà ? La journée a disparu.' },
      { x: 2.5, z: -1.6, r: 0.9, message: () => 'Neurologue jeudi. Il faudra trouver quelqu’un pour m’y emmener.' },
      { x: -1.6, z: -0.8, r: 0.9, message: (i) => (i > 0.6 ? 'Douze heures de sommeil, et je suis encore épuisé. Mal partout, comme après un marathon.' : 'J’ai bien dormi. Un peu fatigué, c’est tout.') },
    ],
    eyeHeight: () => 1.62,
    speed: (i) => 0.95 - 0.4 * i,
    // Brouillard de la mémoire : flou léger et lent, sans aucune variation de lumière.
    canvasFilter(t, i) {
      const wave = Math.pow((Math.sin((t * 2 * Math.PI) / 18) + 1) / 2, 4)
      return `blur(${(0.5 * i + wave * 2.5 * i).toFixed(2)}px) saturate(${(1 - 0.35 * i).toFixed(2)})`
    },
    update() {},
  }
}

// ——— Parkinson : porter un verre jusqu'au salon ———

export function parkinson(): BuiltScene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#d8ccb8')
  room(scene, 3, 14, 2.6, '#7a5a3e', '#d8ccb8', '#ece4d8')
  lights(scene, '#fff3dc', '#6a5a48', 1.5)

  // Cloison et porte du salon.
  box(scene, 1.05, 2.6, 0.15, '#cbbfa9', -0.98, 0, -3)
  box(scene, 1.05, 2.6, 0.15, '#cbbfa9', 0.98, 0, -3)
  box(scene, 0.9, 0.5, 0.15, '#cbbfa9', 0, 2.1, -3)
  box(scene, 2.2, 0.7, 0.8, '#5a6a7a', 0, 0, -6.4) // canapé
  box(scene, 0.9, 0.45, 0.6, '#9c7a52', 0.6, 0, -5.2) // table basse
  const salon = label('Le salon', 0.9, 0.25, { bg: '#f4efe8', fg: '#15120f' })
  salon.position.set(0, 2.3, -2.92)
  scene.add(salon)

  // Main et verre, toujours devant soi.
  const hand = new THREE.Group()
  const fingers = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.05, 4, 8), mat('#c68863'))
  fingers.position.set(0.04, -0.005, 0.01)
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.11, 20, 1, true),
    new THREE.MeshStandardMaterial({ color: '#e8f2f5', transparent: true, opacity: 0.35, side: THREE.DoubleSide }))
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.028, 1, 20), mat('#7fb6d0', { transparent: true, opacity: 0.8 }))
  hand.add(fingers, glass, water)
  scene.add(hand)
  const drops = Array.from({ length: 12 }, () => {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 4), mat('#7fb6d0'))
    d.visible = false
    scene.add(d)
    return { d, v: new THREE.Vector3() }
  })
  const offset = new THREE.Vector3()
  const last = new THREE.Vector3()
  let level = 1
  let now = 0
  let said = 1
  let notice: string | null = null

  const frozen = (i: number) => i > 0.5 && now % 6 < 1.5 + 5 * (i - 0.5)

  return {
    scene,
    start: { x: 0, z: 5.5, yaw: 0, pitch: -0.12 },
    bounds: { minX: -1.2, maxX: 1.2, minZ: -6.6, maxZ: 6.5 },
    obstacles: [
      { minX: -1.6, maxX: -0.45, minZ: -3.08, maxZ: -2.92, blocks: () => true, message: () => '' },
      { minX: 0.45, maxX: 1.6, minZ: -3.08, maxZ: -2.92, blocks: () => true, message: () => '' },
      {
        minX: -0.45, maxX: 0.45, minZ: -3.2, maxZ: -2.6, blocks: (i) => frozen(i),
        message: (i) => (frozen(i) ? 'Mes pieds refusent d’avancer. Derrière moi, les gens s’impatientent.' : ''),
      },
    ],
    zones: [{ x: 0.3, z: -5, r: 0.9, message: () => `Arrivé. Il reste ${Math.round(level * 100)} % du verre.` }],
    eyeHeight: (i) => 1.62 - 0.4 * smooth(0.85, 1, i),
    speed: (i) => 0.95 - 0.45 * i,
    update(dt, t, i, camera) {
      now = t
      // Tremblement de repos (≈ 5 Hz), de faible amplitude : il fait déborder l'eau, il ne secoue pas la vue.
      const a = 0.002 + 0.016 * i
      offset.set(0.08 + Math.sin(t * 31) * a + Math.sin(t * 23) * a * 0.5, -0.16 + Math.sin(t * 29) * a * 0.7, -0.4)
      hand.position.copy(offset.applyQuaternion(camera.quaternion).add(camera.position))
      hand.quaternion.copy(camera.quaternion)
      const moving = last.distanceTo(camera.position) > 0.0005
      last.copy(camera.position)
      const spill = (moving ? 0.06 : 0.008) * i * i
      level = Math.max(0, level - spill * dt)
      water.scale.y = 0.1 * level
      water.position.y = -0.05 + 0.05 * level
      drops.forEach((p) => {
        if (!p.d.visible && level > 0 && Math.random() < spill * dt * 40) {
          p.d.visible = true
          p.d.position.copy(hand.position).add(new THREE.Vector3(0, 0.05, 0))
          p.v.set((Math.random() - 0.5) * 0.4, 0.3, (Math.random() - 0.5) * 0.4)
        }
        if (p.d.visible) {
          p.v.y -= 9.8 * dt
          p.d.position.addScaledVector(p.v, dt)
          if (p.d.position.y < 0) p.d.visible = false
        }
      })
      for (const step of [0.75, 0.5, 0.25]) {
        if (level < step && said > step) {
          said = step
          notice = `L’eau déborde à chaque pas. Il reste ${Math.round(step * 100)} % du verre.`
        }
      }
    },
    notice() {
      const n = notice
      notice = null
      return n
    },
  }
}

// ——— Sclérose en plaques : une journée qui s'alourdit ———

export function sep(): BuiltScene {
  const scene = new THREE.Scene()
  const sky = new THREE.Color('#cfe0ea')
  scene.background = sky
  scene.fog = new THREE.Fog(sky, 30, 90)
  const hemi = new THREE.HemisphereLight('#fff6e6', '#4a5a3a', 1.6)
  const sun = new THREE.DirectionalLight('#fff1dc', 1.6)
  sun.position.set(5, 20, 5)
  scene.add(hemi, sun)

  box(scene, 60, 0.1, 130, '#6b7a4a', 0, -0.1, -55)
  box(scene, 2.4, 0.02, 122, '#b8a98c', 0, 0, -55)
  for (let z = 2; z > -110; z -= 7) {
    for (const x of [-3.2, 3.2]) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.4, 8), mat('#5a4030'))
      trunk.position.set(x + Math.sin(z) * 0.6, 1.2, z)
      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 10), mat(z % 14 ? '#4f6b34' : '#5f7a3a'))
      crown.position.set(trunk.position.x, 3, z)
      scene.add(trunk, crown)
    }
    if (z % 28 === 2) box(scene, 1.4, 0.45, 0.45, '#7a5a3e', -1.9, 0, z - 3)
  }
  box(scene, 1.8, 1.3, 4, '#b03a2e', 0, 0, -72)
  const car = label('Votre voiture', 1.4, 0.35, { bg: '#f4efe8', fg: '#15120f' })
  car.position.set(0, 2, -69.9)
  scene.add(car)

  const morning = new THREE.Color('#cfe0ea')
  const evening = new THREE.Color('#d9a27a')
  const dusk = new THREE.Color('#6a5a6e')
  const state = { progress: 0, fatigue: 0, i: 0 }
  const moments = [
    [0, '9 h · Ce matin, tout va bien. 70 m jusqu’à la voiture, facile.'],
    [0.3, '13 h · Les jambes deviennent lourdes. Il fait chaud.'],
    [0.6, '16 h · Ma vue se trouble par moments. Encore un banc.'],
    [0.9, '18 h · La voiture est là. J’ai mis toute la journée.'],
  ] as const
  let told = -1

  return {
    scene,
    start: { x: 0, z: 4, yaw: 0, pitch: -0.05 },
    bounds: { minX: -6, maxX: 6, minZ: -69, maxZ: 6 },
    obstacles: [],
    zones: [],
    eyeHeight: () => 1.65 - 0.07 * state.fatigue,
    // La fatigue s'accumule avec la distance : à la fin, on avance quatre fois moins vite.
    speed: () => Math.max(0.3, 1.4 * (1 - state.fatigue)),
    update(_dt, _t, i, camera) {
      state.i = i
      state.progress = Math.min(1, Math.max(0, (4 - camera.position.z) / 73))
      state.fatigue = Math.min(0.78, state.progress * (0.35 + 0.65 * i) + 0.08 * i)
      const p = state.progress
      sky.copy(p < 0.6 ? morning.clone().lerp(evening, p / 0.6) : evening.clone().lerp(dusk, (p - 0.6) / 0.4))
      ;(scene.fog as THREE.Fog).color.copy(sky)
      hemi.intensity = 1.6 - 0.6 * p
    },
    canvasFilter(t, i) {
      // Épisodes de vue trouble, lents et progressifs (≈ toutes les 22 s).
      const wave = Math.pow(Math.max(0, Math.sin((t * 2 * Math.PI) / 22)), 6)
      const blur = wave * (1 + 5 * i) * (0.4 + state.progress)
      return `blur(${blur.toFixed(2)}px) saturate(${(1 - 0.3 * state.fatigue).toFixed(2)})`
    },
    notice() {
      let k = -1
      moments.forEach(([at], n) => { if (state.progress >= at) k = n })
      if (k <= told) return null
      told = k
      return moments[k][1]
    },
    caption() {
      const minutes = 9 * 60 + Math.round(state.progress * 9 * 60)
      return { key: 'h', text: `Heure : ${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}` }
    },
  }
}

// ——— SLA : écrire avec le regard ———

const keyRows = ['ABCDEF', 'GHIJKL', 'MNOPQR', 'STUVWX', 'YZ’ ⌫✓']
const friendGuesses = ['Tu veux… de l’eau ?', 'Attends, je devine : tu as faim ?', 'Tu as froid, c’est ça ?', 'Je finis pour toi, ça ira plus vite.']

export function sla(): BuiltScene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#e3d8c6')
  room(scene, 6, 6, 2.7, '#8a7560', '#e3d8c6', '#f0e9dd')
  lights(scene, '#fff3dc', '#6a5a48', 1.5)

  box(scene, 2.2, 0.75, 0.9, '#6a7a5a', 0.6, 0, -2.4) // canapé
  const friend = person(scene, 0.9, -1.6, 9, 1.3)
  friend.group.rotation.y = Math.PI
  box(scene, 0.03, 0.42, 0.03, '#2a2a2a', 0, 0.45, 0.38) // bras support, derrière la tablette

  const W = 1000
  const H = 720
  const tablet = surface(W, H, 0.5, 0.36)
  tablet.mesh.position.set(0, 1.05, 0.45)
  tablet.mesh.rotation.x = -0.25
  scene.add(tablet.mesh)

  const ray = new THREE.Raycaster()
  const center = new THREE.Vector2(0, 0)
  let text = ''
  let gaze = -1
  let dwell = 0
  let armed = true
  let sent = ''
  let sentAt = -99
  let lastDraw = ''
  let tNow = 0
  let started = false

  const keyAt = (u: number, v: number) => {
    const x = u * W
    const y = (1 - v) * H
    if (y < 150) return -1
    const row = Math.floor((y - 150) / ((H - 150) / keyRows.length))
    const col = Math.floor(x / (W / 6))
    return row * 6 + col
  }

  const draw = (need: number) => {
    const c = tablet.ctx
    c.fillStyle = '#15120f'
    c.fillRect(0, 0, W, H)
    c.fillStyle = '#f4efe8'
    c.font = '600 54px Barlow, sans-serif'
    c.textAlign = 'left'
    c.fillText(text + (Math.floor(tNow * 1.5) % 2 ? '|' : ''), 30, 95)
    const kh = (H - 150) / keyRows.length
    keyRows.forEach((row, r) => {
      ;[...row].forEach((ch, col) => {
        const k = r * 6 + col
        const x = col * (W / 6)
        const y = 150 + r * kh
        c.fillStyle = k === gaze ? '#3a4a2a' : '#2a231c'
        c.fillRect(x + 6, y + 6, W / 6 - 12, kh - 12)
        if (k === gaze && dwell > 0) {
          c.fillStyle = '#c8f560'
          c.fillRect(x + 6, y + kh - 18, (W / 6 - 12) * Math.min(1, dwell / need), 12)
        }
        c.fillStyle = '#f4efe8'
        c.font = '600 56px Barlow, sans-serif'
        c.textAlign = 'center'
        c.fillText(ch === ' ' ? '␣' : ch, x + W / 12, y + kh / 2 + 20)
      })
    })
    tablet.tex.needsUpdate = true
  }

  return {
    scene,
    start: { x: 0, z: 1, yaw: 0, pitch: -0.3 },
    bounds: { minX: -0.1, maxX: 0.1, minZ: 0.9, maxZ: 1.1 },
    obstacles: [],
    zones: [],
    lookOnly: true,
    reticle: true,
    eyeHeight: () => 1.2,
    speed: () => 0,
    update(dt, t, i, camera) {
      tNow = t
      // Le temps de fixation nécessaire pour valider une lettre s'allonge avec le stade.
      const need = 0.9 + 1.8 * i
      ray.setFromCamera(center, camera)
      const hit = ray.intersectObject(tablet.mesh)[0]
      const k = hit?.uv ? keyAt(hit.uv.x, hit.uv.y) : -1
      // Comme sur une vraie commande oculaire, il faut quitter la touche avant de pouvoir la revalider.
      if (k !== gaze) { gaze = k; dwell = 0; armed = true }
      else if (k >= 0 && armed) dwell += dt
      if (k >= 0 && armed && dwell >= need) {
        dwell = 0
        armed = false
        const ch = keyRows[Math.floor(k / 6)][k % 6]
        if (ch === '⌫') text = text.slice(0, -1)
        else if (ch === '✓') { if (text.trim()) { sent = text; sentAt = t; text = '' } }
        else if (text.length < 22) text += ch
      }
      const key = `${text}|${gaze}|${Math.round(dwell * 20)}|${Math.floor(t * 1.5) % 2}`
      if (key !== lastDraw) { lastDraw = key; draw(need) }
      friend.head.rotation.y = Math.sin(t * 0.6) * 0.3
    },
    notice(t) {
      if (started || t < 0.8) return null
      started = true
      return 'Écrivez « J’AI SOIF » avec les yeux : gardez le point central sur une lettre, puis sur ✓.'
    },
    caption(t) {
      if (t - sentAt < 5) return { key: `s${sentAt}`, text: `Vous : « ${sent} »  ·  Votre ami : Ah ! Merci d’avoir pris le temps.` }
      // L'ami, plein de bonne volonté, essaie de deviner et coupe la phrase.
      if (text.length > 0 && t % 10 < 4) {
        const n = Math.floor(t / 10) % friendGuesses.length
        return { key: `g${n}`, text: `Votre ami : ${friendGuesses[n]}` }
      }
      return null
    },
  }
}

// ——— Schizophrénie : un trajet en bus ———
// Scène provisoire : le PRD demande qu'elle soit co-écrite avec un témoin. Les phrases
// ci-dessous sont des exemples de ton, à remplacer par les siennes.
// Intensité : stabilisation ≈ 0,15 · phase prodromique ≈ 0,35 · phase aiguë = 1.

const whispers = [
  'Ils te regardent.', 'Le monsieur au fond parle de toi.', 'Tout le monde sait.',
  'Tu as oublié quelque chose. Retourne à la maison.', 'Tu n’y arriveras pas.', 'Ne descends pas ici.',
]
const unease = [
  '[Deux passagers rient. Est-ce qu’ils rient de moi ?]',
  '[Quelqu’un vous regarde, puis détourne les yeux.]',
  '[Tout semble un peu trop net, un peu étrange.]',
]
const calm = ['[Musique dans les écouteurs]', '[Annonce] Prochain arrêt : Mairie.', '[Le bus freine doucement.]']
const coping = {
  aigue: ['Je sais que ces voix ne sont pas réelles.', 'Les ignorer me demande un effort constant.', 'Encore quatre arrêts. Je compte.'],
  prodrome: ['Non. Je suis juste fatigué.', 'J’ai mal dormi, c’est tout.'],
  stable: ['Ça fait deux ans que je vais bien.', 'Mes écouteurs, ma musique. Le trajet passe vite.'],
}
const stops = ['Gare', 'Mairie', 'Lycée Pasteur', 'Hôpital', 'Place du Marché']

export function schizophrenie(): BuiltScene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#9fb2bd')
  lights(scene, '#f2f4f0', '#5a5650', 1.7)

  // Caisse du bus : plancher, plafond, parois vitrées.
  box(scene, 2.5, 0.1, 12, '#4a4a52', 0, -0.1, -2)
  box(scene, 2.5, 0.06, 12, '#d8d8d4', 0, 2.3, -2)
  for (const side of [-1, 1]) {
    box(scene, 0.06, 0.85, 12, '#b8b8b2', side * 1.25, 0, -2)
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(12, 1.1),
      new THREE.MeshStandardMaterial({ color: '#cfe0ea', transparent: true, opacity: 0.12, roughness: 0.1 }))
    pane.position.set(side * 1.25, 1.45, -2)
    pane.rotation.y = -side * Math.PI / 2
    scene.add(pane)
    box(scene, 0.04, 1.6, 0.04, '#e8c33d', side * 0.55, 0, -1.4) // barres de maintien
  }
  const panel = surface(640, 120, 0.9, 0.17)
  panel.mesh.position.set(0, 2.05, -7.9)
  scene.add(panel.mesh)

  // Sièges et passagers ; chacun a des yeux pour que l'on voie quand il tourne la tête.
  const passengers: { head: THREE.Mesh; base: number; target: number }[] = []
  for (let row = 0; row < 5; row++) {
    for (const x of [-0.75, -0.35, 0.35, 0.75]) {
      const z = -1.2 - row * 1.1
      box(scene, 0.38, 0.45, 0.42, '#2f4f6a', x, 0, z)
      box(scene, 0.38, 0.55, 0.08, '#2f4f6a', x, 0.45, z + 0.2)
      if (hash(`${row}:${x}`) < 0.55) {
        const p = person(scene, x, z, row * 4 + x * 10, 1.3)
        for (const ex of [-0.045, 0.045]) {
          const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 4), mat('#15120f'))
          eye.position.set(ex, 0.02, -0.12)
          p.head.add(eye)
        }
        passengers.push({ head: p.head, base: 0, target: 0 })
      }
    }
  }
  // Propre siège, côté fenêtre, au fond.
  box(scene, 0.38, 0.45, 0.42, '#2f4f6a', -0.75, 0, 0)

  // Paysage qui défile derrière les vitres.
  const outside = Array.from({ length: 16 }, (_, k) => {
    const side = k % 2 ? 1 : -1
    const b = box(scene, 2.5, 3 + hash(`b${k}`) * 6, 3, pick(['#b07a52', '#c9a27e', '#8e5f45', '#d1b08c'], k), side * 6, -0.5, -40 + k * 5)
    return b
  })

  let n = -1
  let stop = 0
  let lastPanel = ''

  return {
    scene,
    start: { x: -0.75, z: 0.1, yaw: 0, pitch: -0.05 },
    bounds: { minX: -0.75, maxX: -0.75, minZ: 0.1, maxZ: 0.1 },
    obstacles: [],
    zones: [],
    lookOnly: true,
    eyeHeight: () => 1.18,
    speed: () => 0,
    update(dt, t, i) {
      for (const b of outside) {
        b.position.z += dt * 9
        if (b.position.z > 20) b.position.z -= 80
      }
      // Regards : quelques passagers se tournent vers vous, plus souvent dans les phases difficiles.
      const bucket = Math.floor(t / 3)
      passengers.forEach((p, k) => {
        const look = i > 0.25 && hash(`${k}:${bucket}`) < (i > 0.6 ? 0.35 : 0.15)
        p.target = look ? Math.PI * 0.85 * (p.head.parent!.position.x < -0.5 ? -1 : 1) : 0
        p.head.rotation.y += (p.target - p.head.rotation.y) * (1 - Math.exp(-dt * 3))
      })
      stop = Math.floor(t / 15) % stops.length
      if (String(stop) !== lastPanel) {
        lastPanel = String(stop)
        panel.ctx.fillStyle = '#15120f'
        panel.ctx.fillRect(0, 0, 640, 120)
        panel.ctx.fillStyle = '#f2b46b'
        panel.ctx.font = '500 44px "IBM Plex Mono", monospace'
        panel.ctx.textAlign = 'center'
        panel.ctx.fillText(`Prochain arrêt : ${stops[stop]}`, 320, 75)
        panel.tex.needsUpdate = true
      }
    },
    caption(t, i) {
      // Une « réplique » toutes les 6 s ; en phase aiguë, ce sont des chuchotements spatialisés.
      const cycle = Math.floor(t / 6)
      if (t % 6 > 3.8) return null
      if (i > 0.6) {
        const side = hash(`w${cycle}`) < 0.5 ? -0.8 : 0.8
        return {
          key: `w${cycle}`,
          text: `[Chuchotement, ${side < 0 ? 'à gauche' : 'à droite'}] « ${whispers[cycle % whispers.length]} »`,
          whisper: side,
        }
      }
      if (i > 0.25) return { key: `u${cycle}`, text: unease[cycle % unease.length] }
      if (cycle % 3 === 2) return { key: `s${cycle}`, text: '[Un chuchotement, très loin. Il passe.]', whisper: 0.6 }
      return { key: `c${cycle}`, text: calm[cycle % calm.length] }
    },
    notice(t, i) {
      const k = Math.floor((t - 4) / 12)
      if (t < 4 || k === n) return null
      n = k
      const list = i > 0.6 ? coping.aigue : i > 0.25 ? coping.prodrome : coping.stable
      return list[k % list.length]
    },
  }
}
