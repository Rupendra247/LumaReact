import { useEffect, useRef, useState } from 'react'
import LampControls from './LampControls'
import { useLamp } from '../hooks/useLamp'
import { COLORS, DEFAULT_STATE, STORAGE_KEY } from '../utils/constants'

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw)
    const color = COLORS.find((c) => c.name === parsed.color) ?? DEFAULT_STATE.color
    const brightness = Number.isFinite(Number(parsed.brightness))
      ? Math.min(100, Math.max(0, Number(parsed.brightness)))
      : DEFAULT_STATE.brightness
    return { isOn: Boolean(parsed.isOn), color, brightness }
  } catch {
    return DEFAULT_STATE
  }
}

export default function LampApp() {
  const [initial] = useState(loadSavedState)
  const [isOn, setIsOn] = useState(initial.isOn)
  const [color, setColor] = useState(initial.color)
  const [brightness, setBrightness] = useState(initial.brightness)

  // Keep the mutable ref in sync so the (single, persistent)
  // animation loop always reads the latest UI state.
  const stateRef = useRef({ isOn: initial.isOn, color: initial.color.three, brightness: initial.brightness })
  useEffect(() => {
    stateRef.current.isOn = isOn
    stateRef.current.color = color.three
    stateRef.current.brightness = brightness
  }, [isOn, color, brightness])

  // Settings survive a page refresh
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ isOn, color: color.name, brightness }))
  }, [isOn, color, brightness])

  const { mountRef, supported } = useLamp(stateRef, () => setIsOn((prev) => !prev))

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-neutral-950 p-6">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        {supported ? (
          <div ref={mountRef} className="w-full overflow-hidden rounded-2xl" style={{ height: 420 }} />
        ) : (
          <div
            className="flex w-full items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900 text-center text-sm text-neutral-400"
            style={{ height: 420 }}
          >
            <p className="max-w-xs px-6">
              WebGL is not supported in this browser or device. Luma needs WebGL to render the 3D lamp.
            </p>
          </div>
        )}

        <p className="-mt-2 text-sm text-neutral-400">
          Drag the cord to swing it — tap to {isOn ? 'turn off' : 'turn on'} the lamp
        </p>

        <LampControls
          isOn={isOn}
          brightness={brightness}
          color={color}
          onBrightnessChange={setBrightness}
          onColorChange={setColor}
        />
      </div>
    </div>
  )
}