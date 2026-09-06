import * as THREE from 'three'

export function buildLampScene(scene) {
  // ---------- Room (floor only, kept minimal) ----------
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(7, 64),
    new THREE.MeshStandardMaterial({ color: 0x131317, roughness: 0.95, metalness: 0.05 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  // Faint fill light so the lamp reads even when off
  // (intensities are physical units in modern three — r155+)
  const hemi = new THREE.HemisphereLight(0x2a3a4a, 0x08080a, 3.0)
  scene.add(hemi)
  const fill = new THREE.DirectionalLight(0x8fa3c7, 4.0)
  fill.position.set(-3, 4, 2)
  scene.add(fill)
  const ambient = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambient)

  // ---------- Lamp group ----------
  const lamp = new THREE.Group()
  scene.add(lamp)

  const metal = (hex, roughness = 0.35, metalness = 0.6) =>
    new THREE.MeshStandardMaterial({ color: hex, roughness, metalness })

  // Ceiling mount + rod
  const ceilingMount = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.5), metal(0x2a2a2e, 0.6, 0.4))
  ceilingMount.position.y = 3.15
  lamp.add(ceilingMount)

  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 16), metal(0x3a3a3e))
  rod.position.y = 2.87
  lamp.add(rod)

  // Shade (open-ended frustum so light can spill from inside)
  const shadeMat = new THREE.MeshPhysicalMaterial({
    color: 0x3a3a3d,
    roughness: 0.45,
    metalness: 0.05,
    side: THREE.DoubleSide,
    emissive: 0x000000,
    emissiveIntensity: 0,
  })
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.9, 0.75, 40, 1, true), shadeMat)
  shade.position.y = 2.25
  shade.castShadow = true
  lamp.add(shade)

  // Bulb (emissive sphere)
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0x1c1c1e,
    emissive: 0x000000,
    emissiveIntensity: 0,
    roughness: 0.25,
  })
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), bulbMat)
  bulb.position.y = 1.86
  lamp.add(bulb)

  // Point light living inside the bulb
  const bulbLight = new THREE.PointLight(0xffc773, 0, 9, 2)
  bulbLight.position.copy(bulb.position)
  bulbLight.castShadow = true
  bulbLight.shadow.mapSize.set(1024, 1024)
  lamp.add(bulbLight)

  // Soft additive glow sprite around the bulb (fakes bloom cheaply)
  const glowCanvas = document.createElement('canvas')
  glowCanvas.width = glowCanvas.height = 128
  const glowCtx = glowCanvas.getContext('2d')
  const glowGrad = glowCtx.createRadialGradient(64, 64, 0, 64, 64, 64)
  glowGrad.addColorStop(0, 'rgba(255,255,255,1)')
  glowGrad.addColorStop(1, 'rgba(255,255,255,0)')
  glowCtx.fillStyle = glowGrad
  glowCtx.fillRect(0, 0, 128, 128)
  const glowTex = new THREE.CanvasTexture(glowCanvas)

  const glowSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xffc773,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  )
  glowSprite.scale.set(2.3, 2.3, 1)
  glowSprite.position.copy(bulb.position)
  lamp.add(glowSprite)

  // Stand pole + base
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.55, 20), metal(0x2e2e32, 0.3, 0.7))
  pole.position.y = 1.0
  pole.castShadow = true
  lamp.add(pole)

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.12, 40), metal(0x2a2a2e, 0.35, 0.6))
  base.position.y = 0.15
  base.castShadow = true
  base.receiveShadow = true
  lamp.add(base)

  // Pull cord (pivots + swings like a pendulum)
  const cordPivot = new THREE.Group()
  cordPivot.position.copy(bulb.position)
  lamp.add(cordPivot)

  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.011, 0.011, 0.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x8a8a8e, roughness: 0.6 })
  )
  cord.position.y = -0.28
  cordPivot.add(cord)

  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0xc9c9cc, roughness: 0.4, metalness: 0.3 })
  )
  knob.position.y = -0.54
  cordPivot.add(knob)

  return { lamp, cordPivot, cord, knob, bulbLight, bulb, shade, glowSprite }
}