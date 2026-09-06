import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { buildLampScene } from '../scene/buildLamp'
import { stepPendulum } from '../physics/pendulum'
import { LIGHT, PENDULUM } from '../utils/constants'

export function useLamp(stateRef, onTap) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    let width = mount.clientWidth
    let height = mount.clientHeight

    // ---------- Scene / camera / renderer ----------
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0d)
    scene.fog = new THREE.Fog(0x0a0a0d, 6, 16)

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100)
    camera.position.set(0, 1.7, 6.4)
    camera.lookAt(0, 1.4, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.8
    mount.appendChild(renderer.domElement)

    const { lamp, cordPivot, cord, knob, bulbLight, bulb, shade, glowSprite } = buildLampScene(scene)

    // ---------- Drag the cord to swing it, tap to toggle ----------
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const dragPlane = new THREE.Plane()
    const worldPivot = new THREE.Vector3()
    const localPoint = new THREE.Vector3()
    let angle = 0
    let angularVel = 0
    let dragging = false
    let dragStartX = 0
    let dragStartY = 0
    let prevDragAngle = 0
    let lastDragTime = 0

    function angleFromPointer() {
      cordPivot.getWorldPosition(worldPivot)
      dragPlane.set(new THREE.Vector3(0, 0, 1), -worldPivot.z)
      raycaster.setFromCamera(pointer, camera)
      if (!raycaster.ray.intersectPlane(dragPlane, localPoint)) return 0

      lamp.worldToLocal(localPoint)
      const dx = localPoint.x - cordPivot.position.x
      const dy = localPoint.y - cordPivot.position.y
      return Math.atan2(dx, -dy)
    }

    function updatePointer(e) {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }

    function onPointerDown(e) {
      updatePointer(e)
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects([cord, knob], false)
      if (hits.length > 0) {
        dragging = true
        dragStartX = e.clientX
        dragStartY = e.clientY
        prevDragAngle = angle
        lastDragTime = performance.now()
        renderer.domElement.setPointerCapture(e.pointerId)
      }
    }

    function onPointerMove(e) {
      if (!dragging) return
      updatePointer(e)
      const target = THREE.MathUtils.clamp(angleFromPointer(), -PENDULUM.maxDragAngle, PENDULUM.maxDragAngle)
      const now = performance.now()
      const dt = (now - lastDragTime) / 1000
      if (dt > 0) angularVel = (target - prevDragAngle) / dt
      prevDragAngle = target
      lastDragTime = now
      angle = target
    }

    function onPointerUp(e) {
      if (!dragging) return
      dragging = false
      renderer.domElement.releasePointerCapture(e.pointerId)
      if (Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY) < LIGHT.tapThresholdPx) {
        onTap()
      }
    }
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.style.cursor = 'grab'

    // ---------- Animation loop ----------
    const timer = new THREE.Timer()
    let raf
    function animate() {
      raf = requestAnimationFrame(animate)
      timer.update()
      const dt = Math.min(timer.getDelta(), 0.05)

      // Damped pendulum physics for the cord
      // (skipped while you're holding it — your drag IS the controller)
      if (!dragging) {
        const next = stepPendulum({ angle, angularVel }, dt)
        angle = next.angle
        angularVel = next.angularVel
      }
      cordPivot.rotation.z = angle

      // Sync visuals with current on/off, color, brightness
      const s = stateRef.current
      const targetIntensity = s.isOn ? (s.brightness / 100) * LIGHT.maxIntensity : 0
      bulbLight.intensity += (targetIntensity - bulbLight.intensity) * 0.12
      bulbLight.color.setHex(s.color)

      bulb.material.emissive.setHex(s.isOn ? s.color : 0x000000)
      bulb.material.emissiveIntensity = s.isOn ? 0.7 + (s.brightness / 100) * 1.6 : 0

      shade.material.emissive.setHex(s.isOn ? s.color : 0x000000)
      shade.material.emissiveIntensity = s.isOn ? 0.2 + (s.brightness / 100) * 0.35 : 0

      glowSprite.material.color.setHex(s.color)
      const targetGlow = s.isOn ? 0.3 + (s.brightness / 100) * 0.45 : 0
      glowSprite.material.opacity += (targetGlow - glowSprite.material.opacity) * 0.12

      // Gentle showcase auto-rotation
      lamp.rotation.y = Math.sin(performance.now() * 0.00012) * 0.18

      renderer.render(scene, camera)
    }
    animate()

    function handleResize() {
      width = mount.clientWidth
      height = mount.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.dispose()
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
          else obj.material.dispose()
        }
      })
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return mountRef
}