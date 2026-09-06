export const COLORS = [
  { name: 'Warm', css: '#FFC773', three: 0xffc773 },
  { name: 'Cool', css: '#8FD3FF', three: 0x8fd3ff },
  { name: 'Soft Pink', css: '#FFA8C9', three: 0xffa8c9 },
  { name: 'Mint', css: '#8DEFC7', three: 0x8defc7 },
]

export const DEFAULT_STATE = { isOn: false, color: COLORS[0], brightness: 70 }

export const PENDULUM = { stiffness: 7, damping: 3.4, maxDragAngle: 1.2 }

export const LIGHT = { maxIntensity: 60, tapThresholdPx: 6 }

export const STORAGE_KEY = 'luma-lamp-settings'