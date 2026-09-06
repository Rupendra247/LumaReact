import { COLORS } from '../utils/constants'

export default function LampControls({ isOn, brightness, color, onBrightnessChange, onColorChange }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label className="text-sm text-neutral-300">Brightness: {brightness}%</label>
        <input
          type="range"
          min={0}
          max={100}
          value={brightness}
          onChange={(e) => onBrightnessChange(Number(e.target.value))}
          disabled={!isOn}
          className="w-full accent-current"
        />
      </div>

      <div className="flex gap-3">
        {COLORS.map((c) => (
          <button
            key={c.css}
            onClick={() => onColorChange(c)}
            className="h-9 w-9 rounded-full border-2 transition-transform"
            style={{
              backgroundColor: c.css,
              borderColor: color.css === c.css ? '#ffffff' : 'transparent',
              transform: color.css === c.css ? 'scale(1.15)' : 'scale(1)',
            }}
            aria-label={c.name}
            title={c.name}
          />
        ))}
      </div>
    </div>
  )
}