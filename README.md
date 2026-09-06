# Luma — Interactive 3D Lamp

A live, physics-based 3D lamp built with **Vite + React + Tailwind CSS v4 + Three.js**.

Pull the cord, change the color, dim the light — everything runs in a real WebGL
scene with shadows, tone mapping, and a damped pendulum.

## Features

- **Pull-cord physics** — grab the cord and swing it; it swings on release with
  real damped-oscillator dynamics (`src/physics/pendulum.js`)
- **Tap to toggle** — a quick tap on the cord turns the lamp on/off
- **Brightness slider** — controls the bulb's point-light intensity
- **Color picker** — four light colors (Warm, Cool, Soft Pink, Mint)
- **Persistent settings** — on/off state, color, and brightness survive a
  page refresh via `localStorage`
- Soft shadows, ACES filmic tone mapping, and a cheap additive-glow sprite

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. Drag the hanging cord to swing the lamp; tap it to
toggle the power.

## Project structure

```
src/
├── App.jsx                    # renders LampApp
├── components/
│   ├── LampApp.jsx            # container: state + persistence + layout
│   └── LampControls.jsx       # slider + color swatches (pure UI)
├── hooks/
│   └── useLamp.js             # renderer, animation loop, drag interaction
├── scene/
│   └── buildLamp.js           # room + lamp geometry/materials/lights
├── physics/
│   └── pendulum.js            # pure damped-pendulum step function
└── utils/
    └── constants.js           # colors, physics params, storage key
```

## How the pieces talk

React state (`useState`) drives the UI. The Three.js animation loop is
imperative and lives outside React, so it reads the latest UI values through a
mutable ref (`stateRef`) instead of closing over props — see `LampApp.jsx`.

## Tuning

- Swing feel (`stiffness`, `damping`) — `src/utils/constants.js`
- Room brightness (light intensities, exposure) — `src/scene/buildLamp.js`,
  `src/hooks/useLamp.js`

> Note: this project targets Three.js r185, where lighting uses **physical
> units** (lux/candela). Light intensities are much larger than the legacy
> (pre-r155) values.